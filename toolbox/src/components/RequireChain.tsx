import { useWalletStore } from "../lib/walletStore";
import { avalancheFuji, Chain } from "viem/chains";
import { Button } from "./Button";
import { useState } from "react";
import { useErrorBoundary } from "react-error-boundary";

export function RequireChain({ children, chain }: { children: React.ReactNode, chain: Chain }) {
    const { walletChainId, coreWalletClient } = useWalletStore();
    const [isSwitching, setIsSwitching] = useState(false);
    const { showBoundary } = useErrorBoundary();

    async function switchToChain() {
        try {
            setIsSwitching(true);
            await coreWalletClient.addChain({ chain: chain });
            await coreWalletClient.switchChain({ id: chain.id });
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
                Before you continue, please switch to {avalancheFuji.name} network using form below:
            </div>
            <div className="p-4 rounded-lg border border-gray-500">
                <Button onClick={switchToChain}>
                    Switch to {avalancheFuji.name}
                </Button>
            </div>
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
        </>
    }
}
