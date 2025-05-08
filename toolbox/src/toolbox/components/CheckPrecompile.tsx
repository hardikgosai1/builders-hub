import { useState, useEffect } from "react";
import { useViemChainStore } from "../toolboxStore";
import { getActiveRulesAt } from "../../coreViem/methods/getActiveRulesAt";

type PrecompileConfigKey =
    | "warpConfig"
    | "contractDeployerAllowListConfig"
    | "txAllowListConfig"
    | "feeManagerConfig"
    | "rewardManagerConfig"
    | "contractNativeMinterConfig";

interface CheckPrecompileProps {
    children: React.ReactNode;
    configKey: PrecompileConfigKey;
    precompileName: string;
}

export const CheckPrecompile = ({ children, configKey, precompileName }: CheckPrecompileProps) => {
    const viemChain = useViemChainStore();
    const [isPrecompileActive, setIsPrecompileActive] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (hasChecked || isChecking || !viemChain?.rpcUrls?.default?.http?.[0]) {
            return;
        }

        async function checkPrecompileStatus() {
            try {
                setIsChecking(true);
                if (!viemChain) {
                    throw new Error('Chain not available');
                }
                const rpcUrl = viemChain.rpcUrls.default.http[0];

                const data = await getActiveRulesAt(rpcUrl);
                setIsPrecompileActive(data?.result?.precompiles?.[configKey]?.timestamp !== undefined);
            } catch (error) {
                setIsPrecompileActive(false);
            } finally {
                setIsChecking(false);
                setHasChecked(true);
            }
        }

        checkPrecompileStatus();
    }, [viemChain, hasChecked, isChecking, configKey]);

    if (isChecking) {
        return <div>Checking precompile availability...</div>;
    }

    if (!isPrecompileActive) {
        return <div>The {precompileName} precompile is not available on this chain.</div>;
    }

    return <>{children}</>;
}; 