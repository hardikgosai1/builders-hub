"use client";

import { useState } from "react";
import Steps from "./components/Steps";
import ToolHeader from "./components/ToolHeader";
import { stepGroups, stepList } from "./stepList";


export default function L1Launcher() {
    const [currentStep, setCurrentStep] = useState<keyof typeof stepList>("genesis");

    const onReset = () => {
        alert("TODO: Implement reset");
    }

    return <>
        <div className="container mx-auto max-w-6xl p-8 ">
            <ToolHeader
                title="L1 Launcher"
                duration="30 min"
                description="Launch your self-hosted Testnet or Mainnet L1 on your own infrastructure"
                githubDir="l1-launcher"
                issuePath="/tools/l1-launcher"
                issueTitle="Update L1 Launcher Tool Information"
            />
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-80 mb-8">
                    <Steps stepGroups={stepGroups} stepList={stepList} currentStep={currentStep} maxAdvancedStep={"add-to-wallet"} advanceTo={(step) => { setCurrentStep(step) }} onReset={() => { setCurrentStep("genesis") }} />
                    {/* Reset button */}
                    <div className="mt-8 -ml-4 w-full">
                        <button
                            onClick={onReset}
                            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 border border-red-100 dark:border-red-900/50"
                        >
                            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Start Over
                        </button>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="h-full">
                        {stepList[currentStep].component}
                    </div>
                </div>
            </div>
        </div>
    </>
}
