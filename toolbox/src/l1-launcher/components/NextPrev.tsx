import { useL1LauncherStore } from "../L1LauncherStore";
import { stepList } from "../stepList";
import { Button } from "../../components/Button";

export default function NextPrev() {
    const steps = Object.keys(stepList);
    const { stepsCurrentStep, setStepsCurrentStep } = useL1LauncherStore();

    return <div className="flex justify-between gap-16">
        <Button onClick={() => setStepsCurrentStep(steps[steps.indexOf(stepsCurrentStep) - 1])} variant="secondary">Previous</Button>
        <Button onClick={() => setStepsCurrentStep(steps[steps.indexOf(stepsCurrentStep) + 1])}>Next</Button>
    </div>;
}
