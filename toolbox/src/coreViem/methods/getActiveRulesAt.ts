export interface ActiveRulesResponse {
    result?: {
        precompiles?: {
            warpConfig?: { timestamp: number };
            contractDeployerAllowListConfig?: { timestamp: number };
            txAllowListConfig?: { timestamp: number };
            feeManagerConfig?: { timestamp: number };
            rewardManagerConfig?: { timestamp: number };
            contractNativeMinterConfig?: { timestamp: number };
        };
    };
}

export async function getActiveRulesAt(rpcUrl: string): Promise<ActiveRulesResponse> {
    const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getActiveRulesAt",
            params: [],
            id: 1
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
} 