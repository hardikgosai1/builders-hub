"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type SingleStep = {
  type: "single";
  key: string;
  title: string;
  description?: string;
  optional?: boolean;
  component: React.ComponentType;
};

type BranchOption = {
  key: string;
  label: string;
  component: React.ComponentType;
};

type BranchStep = {
  type: "branch";
  key: string;
  title: string;
  description?: string;
  optional?: boolean;
  options: BranchOption[];
};

export type StepDefinition = SingleStep | BranchStep;

export type StepFlowProps = {
  steps: StepDefinition[];
  className?: string;
  initialStepIndex?: number;
  initialBranchSelections?: Record<string, string>;
  onFinish?: () => void;
};

export default function StepFlow({
  steps,
  className,
  initialStepIndex = 0,
  initialBranchSelections,
  onFinish,
}: StepFlowProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [currentIndex, setCurrentIndex] = useState<number>(initialStepIndex);
  const [branchSelections, setBranchSelections] = useState<Record<string, string>>(
    () => {
      const defaults: Record<string, string> = { ...(initialBranchSelections || {}) };
      for (const step of steps) {
        if (step.type === "branch") {
          if (!defaults[step.key]) {
            defaults[step.key] = step.options[0]?.key;
          }
        }
      }
      return defaults;
    }
  );

  // Handle URL-based step navigation
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      // Find the step by key
      const stepIndex = steps.findIndex(step => {
        if (step.type === 'single') {
          return step.key === stepParam;
        } else {
          // For branch steps, check if the param matches any option
          const [branchKey, optionKey] = stepParam.includes(':') 
            ? stepParam.split(':') 
            : [step.key, stepParam];
          
          if (step.key === branchKey) {
            // If we have a specific option, select it
            if (optionKey && step.options.some(opt => opt.key === optionKey)) {
              setBranchSelections(prev => ({ ...prev, [step.key]: optionKey }));
            }
            return true;
          }
          
          // Also check if stepParam matches any option key directly
          return step.options.some(opt => opt.key === stepParam);
        }
      });
      
      if (stepIndex !== -1) {
        setCurrentIndex(stepIndex);
        
        // For branch steps, also set the selection if specified
        const step = steps[stepIndex];
        if (step.type === 'branch' && stepParam.includes(':')) {
          const [, optionKey] = stepParam.split(':');
          if (step.options.some(opt => opt.key === optionKey)) {
            setBranchSelections(prev => ({ ...prev, [step.key]: optionKey }));
          }
        }
      }
    }
  }, [searchParams, steps]);

  // Update URL when step changes
  const updateURL = (stepIndex: number, branchKey?: string, optionKey?: string) => {
    const step = steps[stepIndex];
    const params = new URLSearchParams(searchParams.toString());
    
    if (step.type === 'single') {
      params.set('step', step.key);
    } else if (branchKey && optionKey) {
      // For branch steps, include both the branch key and option key
      params.set('step', `${branchKey}:${optionKey}`);
    } else {
      // Default to just the step key
      params.set('step', step.key);
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const totalSteps = steps.length;
  const atFirst = currentIndex <= 0;
  const atLast = currentIndex >= totalSteps - 1;

  const currentStep = steps[currentIndex];

  const CurrentComponent = useMemo(() => {
    if (currentStep.type === "single") return currentStep.component;
    const selectedKey = branchSelections[currentStep.key] || currentStep.options[0]?.key;
    const selected = currentStep.options.find((o) => o.key === selectedKey) || currentStep.options[0];
    return selected.component;
  }, [currentStep, branchSelections]);

  type NavItem = {
    key: string;
    label: string;
    stepIndex: number;
    isBranchOption: boolean;
    branchKey?: string;
    optionKey?: string;
  };

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [];
    steps.forEach((s, idx) => {
      if (s.type === "branch") {
        s.options.forEach((opt) => {
          items.push({
            key: `${s.key}:${opt.key}`,
            label: opt.label,
            stepIndex: idx,
            isBranchOption: true,
            branchKey: s.key,
            optionKey: opt.key,
          });
        });
      } else {
        items.push({
          key: s.key,
          label: s.title,
          stepIndex: idx,
          isBranchOption: false,
        });
      }
    });
    return items;
  }, [steps]);

  const goNext = () => {
    if (atLast) {
      onFinish?.();
      return;
    }
    const nextIndex = Math.min(currentIndex + 1, totalSteps - 1);
    setCurrentIndex(nextIndex);
    updateURL(nextIndex);
  };

  const goPrev = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prevIndex);
    updateURL(prevIndex);
  };

  const skipStep = () => {
    if (!("optional" in currentStep) || !currentStep.optional) return;
    goNext();
  };

  const navigateToStep = (stepIdx: number, branchKey?: string, optionKey?: string) => {
    setCurrentIndex(stepIdx);
    if (branchKey && optionKey) {
      setBranchSelections(prev => ({ ...prev, [branchKey]: optionKey }));
    }
    updateURL(stepIdx, branchKey, optionKey);
  };

  return (
    <div className={className}>
      <nav className="mb-6">
        <ol className="flex flex-wrap items-center justify-center gap-3 text-sm">
          {steps.map((s, stepIdx) => {
            const isDoneStep = stepIdx < currentIndex;
            const isActiveStep = stepIdx === currentIndex;
            return (
              <li key={s.key} className="flex items-center gap-3">
                {s.type === "single" ? (
                  <button
                    type="button"
                    onClick={() => navigateToStep(stepIdx)}
                    className={[
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 border",
                      isActiveStep
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : isDoneStep
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300",
                      "optional" in s && s.optional ? "border-dashed" : ""
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                        isActiveStep
                          ? "bg-blue-600 text-white"
                          : isDoneStep
                          ? "bg-green-600 text-white"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200",
                        
                      ].join(" ")}
                    >
                      {stepIdx + 1}
                    </span>
                    <span>{s.title}</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {s.options.map((opt, optIdx) => {
                      const isActive = isActiveStep && (branchSelections[s.key] || s.options[0]?.key) === opt.key;
                      const isDone = isDoneStep;
                      return (
                        <React.Fragment key={`${s.key}:${opt.key}`}>
                          <button
                            type="button"
                            onClick={() => navigateToStep(stepIdx, s.key, opt.key)}
                            className={[
                              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 border",
                              isActive
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : isDone
                                ? "border-green-500 text-green-600 dark:text-green-400"
                                : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300",
                                "optional" in s && s.optional ? "border-dashed" : ""
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : isDone
                                  ? "bg-green-600 text-white"
                                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200",
                              ].join(" ")}
                            >
                              {stepIdx + 1}
                            </span>
                            <span>{opt.label}</span>
                          </button>
                          {optIdx < s.options.length - 1 && (
                            <span className="text-xs uppercase tracking-wide text-zinc-500">or</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
                {stepIdx < steps.length - 1 && (
                  <span className="text-zinc-400">→</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="border-t py-8">
        <div className="min-h-[200px]">
          <CurrentComponent />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={atFirst}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm disabled:opacity-50"
          >
            Back
          </button>

          <div className="flex items-center gap-2">
            {("optional" in currentStep && currentStep.optional) && (
              <button
                type="button"
                onClick={skipStep}
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm"
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm"
            >
              {atLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


