import { useState, useEffect } from "react";
import { getActiveRulesAt } from "../../coreViem/methods/getActiveRulesAt";
import { useWalletStore } from "../../lib/walletStore";

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
    const { coreWalletClient } = useWalletStore();
    const [isPrecompileActive, setIsPrecompileActive] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!coreWalletClient) {
            return;
        }

        async function checkPrecompileStatus() {
            try {
                setIsChecking(true);
                setError(null);

                const data = await getActiveRulesAt(coreWalletClient);
                console.log('Precompile check response:', { data, configKey });

                // If data is null, it means the method doesn't exist on this chain
                if (data === null) {
                    setIsPrecompileActive(false);
                    return;
                }

                // Check if the precompile exists and has a timestamp
                const isActive = Boolean(data.precompiles?.[configKey]?.timestamp);
                setIsPrecompileActive(isActive);
            } catch (err) {
                console.error('Error checking precompile:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setIsPrecompileActive(false);
            } finally {
                setIsChecking(false);
            }
        }

        checkPrecompileStatus();
    }, [coreWalletClient, configKey]);

    if (isChecking) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Checking {precompileName} availability...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-700 dark:text-red-300">Error checking {precompileName}: {error}</p>
            </div>
        );
    }

    if (!isPrecompileActive) {
        return (
            <div className="p-4 border border-yellow-200 rounded-md bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                <p className="text-yellow-700 dark:text-yellow-300">{precompileName} is not available on this chain.</p>
            </div>
        );
    }

    return <>{children}</>;
}; 