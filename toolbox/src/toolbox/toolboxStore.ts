import { create } from 'zustand'
import { persist, createJSONStorage, combine } from 'zustand/middleware'
import { useMemo } from 'react';

// Since we're using immer, we don't need to worry about state immutability as it's handled automatically by immer
// It feels like magic, mate!
import { immer } from 'zustand/middleware/immer'

export const DEFAUT_EVM_VM_ID = "srEXiWaHuhNyGwPUi444Tu47ZEDwxTWrbQiuD7FmgSAQ6X7Dy"

const localStorageWithFallback = () => typeof window !== 'undefined' ? localStorage : {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { }
}

export const useCreateChainStore = create(immer(
    persist(
        combine({
            subnetId: "",
            chainID: "",
            evmChainId: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
            genesisData: "",
            gasLimit: 12 * 1000000,
            targetBlockRate: 2,
            vmId: DEFAUT_EVM_VM_ID,
            evmChainName: "My L1",
        }, (set) => ({
            setSubnetID: (subnetId: string) => set({ subnetId }),
            setChainID: (chainID: string) => set({ chainID }),
            setEvmChainId: (evmChainId: number) => set({ evmChainId }),
            setGenesisData: (genesisData: string) => set({ genesisData }),
            setGasLimit: (gasLimit: number) => set({ gasLimit }),
            setTargetBlockRate: (targetBlockRate: number) => set({ targetBlockRate }),
            setVmId: (vmId: string) => set({ vmId }),
            setEvmChainName: (evmChainName: string) => set({ evmChainName }),
        })),
        {
            name: 'create-chain-store',
            storage: createJSONStorage(localStorageWithFallback),
        },
    ))
)


export type DeployOn = "L1" | "C-Chain";
const oldInitialState = {
    subnetId: "",
    chainName: "My Chain",
    vmId: DEFAUT_EVM_VM_ID,
    chainID: "",
    nodePopJsons: [""] as string[],
    validatorWeights: Array(100).fill(100) as number[],
    managerAddress: "0xfacade0000000000000000000000000000000000",
    L1ID: "",
    L1ConversionSignature: "",
    validatorMessagesLibAddress: "",
    evmChainName: "My L1",
    evmChainRpcUrl: "",
    nodeRpcUrl: "",
    evmChainId: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
    evmChainCoinName: "COIN",
    evmChainIsTestnet: true,
    validatorManagerAddress: "",
    proxyAddress: "0xfacade0000000000000000000000000000000000",
    proxyAdminAddress: "0xdad0000000000000000000000000000000000000" as `0x${string}`,
    genesisData: "",
    teleporterRegistryAddress: "",
    gasLimit: 12000000,
    targetBlockRate: 2,
    icmReceiverAddress: "",
    stakingManagerAddress: "",
    rewardCalculatorAddress: "",
    exampleErc20Address: { "L1": "", "C-Chain": "" } as { L1: string, "C-Chain": string },
    erc20TokenHomeAddress: { "L1": "", "C-Chain": "" } as { L1: string, "C-Chain": string },
    erc20TokenRemoteAddress: { "L1": "", "C-Chain": "" } as { L1: string, "C-Chain": string },
}

export const useOldToolboxStore = create(
    persist(
        combine(oldInitialState, (set) => ({
            setSubnetID: (subnetId: string) => set({ subnetId }),
            setChainName: (chainName: string) => set({ chainName }),
            setVmId: (vmId: string) => set({ vmId }),
            setChainID: (chainID: string) => set({ chainID }),
            setNodePopJsons: (nodePopJsons: string[]) => set({ nodePopJsons }),
            setValidatorWeights: (validatorWeights: number[]) => set({ validatorWeights }),
            setManagerAddress: (managerAddress: string) => set({ managerAddress }),
            setStakingManagerAddress: (stakingManagerAddress: string) => set({ stakingManagerAddress }),
            setRewardCalculatorAddress: (rewardCalculatorAddress: string) => set({ rewardCalculatorAddress }),
            setL1ID: (L1ID: string) => set({ L1ID }),
            setL1ConversionSignature: (L1ConversionSignature: string) => set({ L1ConversionSignature }),
            setValidatorMessagesLibAddress: (validatorMessagesLibAddress: string) => set({ validatorMessagesLibAddress }),
            setEvmChainName: (evmChainName: string) => set({ evmChainName }),
            setEvmChainRpcUrl: (evmChainRpcUrl: string) => set({ evmChainRpcUrl }),
            setNodeRpcUrl: (nodeRpcUrl: string) => set({ nodeRpcUrl }),
            setEvmChainCoinName: (evmChainCoinName: string) => set({ evmChainCoinName }),
            setEvmChainIsTestnet: (evmChainIsTestnet: boolean) => set({ evmChainIsTestnet }),
            setValidatorManagerAddress: (validatorManagerAddress: string) => set({ validatorManagerAddress }),
            setProxyAddress: (proxyAddress: string) => set({ proxyAddress }),
            setProxyAdminAddress: (proxyAdminAddress: `0x${string}`) => set({ proxyAdminAddress }),
            setGenesisData: (genesisData: string) => set({ genesisData }),
            setGasLimit: (gasLimit: number) => set({ gasLimit }),
            setTargetBlockRate: (targetBlockRate: number) => set({ targetBlockRate }),
            reset: () => {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('toolbox-storage');
                    window.location.reload();
                }
            },
            setEvmChainId: (evmChainId: number) => set({ evmChainId }),
            setTeleporterRegistryAddress: (address: string) => set({ teleporterRegistryAddress: address }),
            setIcmReceiverAddress: (address: string) => set({ icmReceiverAddress: address }),
            setExampleErc20Address: (address: string, deployOn: DeployOn) => set((state) => ({ exampleErc20Address: { ...state.exampleErc20Address, [deployOn]: address } })),
            setErc20TokenHomeAddress: (address: string, deployOn: DeployOn) => set((state) => ({ erc20TokenHomeAddress: { ...state.erc20TokenHomeAddress, [deployOn]: address } })),
            setErc20TokenRemoteAddress: (address: string, deployOn: DeployOn) => set((state) => ({ erc20TokenRemoteAddress: { ...state.erc20TokenRemoteAddress, [deployOn]: address } })),
        })),
        {
            name: 'toolbox-storage',
            storage: createJSONStorage(localStorageWithFallback),
        },
    ),
)

import { useShallow } from 'zustand/react/shallow'

export function useViemChainStore() {
    // Use useShallow to select the primitive state values we need
    const chainData = useOldToolboxStore(
        useShallow((state) => ({
            evmChainId: state.evmChainId,
            evmChainName: state.evmChainName,
            evmChainRpcUrl: state.evmChainRpcUrl,
            evmChainCoinName: state.evmChainCoinName,
            evmChainIsTestnet: state.evmChainIsTestnet
        }))
    );

    // Create the viemChain object with useMemo to prevent unnecessary recreation
    const viemChain = useMemo(() => {
        const { evmChainId, evmChainName, evmChainRpcUrl, evmChainCoinName, evmChainIsTestnet } = chainData;

        if (!evmChainId || !evmChainRpcUrl) {
            return null;
        }

        return {
            id: evmChainId,
            name: evmChainName || `Chain #${evmChainId}`,
            rpcUrls: {
                default: { http: [evmChainRpcUrl] },
            },
            nativeCurrency: {
                name: evmChainCoinName || evmChainName + " Coin",
                symbol: evmChainCoinName || evmChainName + " Coin",
                decimals: 18
            },
            isTestnet: evmChainIsTestnet,
        };
    }, [chainData]);

    return viemChain;
}

