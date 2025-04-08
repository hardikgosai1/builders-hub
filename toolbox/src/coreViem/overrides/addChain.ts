import { numberToHex, Account, Transport, Chain, Client } from "viem"

//original: https://github.com/wevm/viem/blob/6931cb5d840642673fc6f34774d9acf5b115d87b/src/actions/wallet/addChain.ts

export type CoreWalletChain = Chain & { isTestnet: boolean }
export type CoreWalletAddChainParameters = { chain: CoreWalletChain }

export async function addChain<
    chain extends Chain | undefined,
    account extends Account | undefined,
>(client: Client<Transport, chain, account>, { chain }: CoreWalletAddChainParameters) {
    const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain

    const params = {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers
            ? Object.values(blockExplorers).map(({ url }) => url)
            : undefined,
        isTestnet: chain.isTestnet,
    }
    console.log(`calling
window.avalanche.request({
        method: 'wallet_addEthereumChain',
        params: [${JSON.stringify(params)}]
})

        `)

    await client.request(
        {
            method: 'wallet_addEthereumChain',
            params: [params],
        },
        { dedupe: true, retryCount: 0 },
    )
}

