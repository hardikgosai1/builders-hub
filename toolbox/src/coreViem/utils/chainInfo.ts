import { getRPCEndpoint } from "./rpc";

export type ChainInfoResult = {
    evmChainID: number,
    subnetId: string,
    name: string
}

export async function queryChainInfo(chainId: string, isTestnet: boolean): Promise<ChainInfoResult> {
    try {
        const response = await fetch(getRPCEndpoint(isTestnet) + '/ext/bc/P', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'platform.getTx',
                params: {
                    txID: chainId,
                    encoding: 'json'
                },
                id: 1
            })
        });

        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`API error: ${data.error.message}`);
        }

        const txData = data.result.tx.unsignedTx;

        // Verify this is a createChain transaction by checking required fields
        if (!txData.genesisData || !txData.subnetID || !txData.chainName || !txData.vmID) {
            throw new Error("Not a valid createChain transaction: missing required fields");
        }

        const genesisDataBase64 = txData.genesisData;

        // Decode and parse genesis data to extract evmChainID
        const genesisJson = JSON.parse(atob(genesisDataBase64));
        const evmChainID = parseInt(genesisJson.config.chainId, 16);

        return {
            evmChainID,
            subnetId: txData.subnetID,
            name: txData.chainName
        };
    } catch (error) {
        console.error("Error fetching chain info:", error);
        throw error;
    }
}
