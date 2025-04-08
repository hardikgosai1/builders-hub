import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { networkIDs } from "@avalabs/avalanchejs";
import { createCoreWalletClient } from '../coreViem';
import { createPublicClient, custom, http } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { zeroAddress } from 'viem';

export const useWalletStore = create(
    combine({
        coreWalletClient: createCoreWalletClient(zeroAddress) as ReturnType<typeof createCoreWalletClient>,
        fujiPublicClient: createPublicClient({
            transport: http(avalancheFuji.rpcUrls.default.http[0]),
        }) as ReturnType<typeof createPublicClient>,
        customPublicClient: createPublicClient({
            //Just a placeholder, replaced by wrappers
            transport: http(avalancheFuji.rpcUrls.default.http[0]),
        }) as ReturnType<typeof createPublicClient>,
        walletEVMAddress: "",
        avalancheNetworkID: networkIDs.FujiID as typeof networkIDs.FujiID | typeof networkIDs.MainnetID,
        pChainAddress: "",
    }, set => ({
        setCoreWalletClient: (coreWalletClient: ReturnType<typeof createCoreWalletClient>) => set({ coreWalletClient }),
        setWalletEVMAddress: (walletEVMAddress: string) => set({ walletEVMAddress }),
        setAvalancheNetworkID: (avalancheNetworkID: typeof networkIDs.FujiID | typeof networkIDs.MainnetID) => set({ avalancheNetworkID }),
        setPChainAddress: (pChainAddress: string) => set({ pChainAddress }),
        setCustomPublicClient: (customPublicClient: ReturnType<typeof createPublicClient>) => set({ customPublicClient }),
    })),
)
