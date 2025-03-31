import { useWalletStore } from "../stores/walletStore";
import { avalancheFuji } from "viem/chains";
import { Button } from "./Button";
import { useState } from "react";
import { useErrorBoundary } from "react-error-boundary";

export function RequireChainFuji({ children }: { children: React.ReactNode }) {
    const { walletChainId, coreWalletClient } = useWalletStore();
    const [isSwitching, setIsSwitching] = useState(false);
    const { showBoundary } = useErrorBoundary();

    async function switchToFuji() {
        try {
            setIsSwitching(true);
            await coreWalletClient.addChain({ chain: avalancheFuji });
            await coreWalletClient.switchChain({ id: avalancheFuji.id });
        } catch (error) {
            showBoundary(error);
        } finally {
            setIsSwitching(false);
        }
    }

    if (isSwitching) {
        return <div>Please confirm the switch in your wallet.</div>
    }

    if (walletChainId === avalancheFuji.id) {
        return children;
    }

    if (walletChainId !== avalancheFuji.id) {
        return <>
            <div className="mb-4">
                Before you continue, please switch to Fuji network using form below:
            </div>
            <div className="p-4 rounded-lg border border-gray-500">
                <Button onClick={switchToFuji}>
                    Switch to Fuji
                </Button>
            </div>
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
        </>
    }
}
