import L1Form from "./L1Form";
import { useViemChainStore } from "../toolboxStore"
import { avalancheFuji } from "viem/chains";
import { RequireChain } from "../../components/RequireChain";
import { useState } from "react";

export function RequireChainToolboxL1({ children }: { children: React.ReactNode }) {
    const viemChain = useViemChainStore();

    const [showForm, setShowForm] = useState(!viemChain);

    if (!showForm) {
        return children;
    }

    return <>
        <div className="space-y-4">
            <div >
                Before you continue, please fill in your L1 chain details below:
            </div>
            <L1Form onComplete={() => setShowForm(false)} />
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
        </div>
    </>
}


export function RequireChainToolbox({ children, requireChain }: { children: React.ReactNode, requireChain: "L1" | "C-Chain" }) {
    if (requireChain === "L1") {
        return <RequireChainToolboxL1>{children}</RequireChainToolboxL1>
    }

    return <RequireChain chain={avalancheFuji}>{children}</RequireChain>
}
