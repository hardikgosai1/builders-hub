import L1Form from "./L1Form";
import { useToolboxStore, useViemChainStore } from "../toolboxStore"
import { useWalletStore } from "../../lib/walletStore"

export function RequireChainToolboxL1({ children }: { children: React.ReactNode }) {
    const { walletChainId } = useWalletStore();
    const { evmChainId } = useToolboxStore();
    const viemChain = useViemChainStore();

    if (walletChainId === evmChainId && !!viemChain) {
        return children;
    }

    return <>
        <div className="space-y-4">
            <div >
                Before you continue, please switch Core wallet to your L1 using form below:
            </div>
            <L1Form />
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
        </div>
    </>
}
