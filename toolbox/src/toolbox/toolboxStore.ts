import { create } from 'zustand'
import { persist, createJSONStorage, combine } from 'zustand/middleware'
import { useMemo } from 'react';

export type DeployOn = "L1" | "C-Chain";

const localStorageComp = () => typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => { }, removeItem: () => { } }

export const EVM_VM_ID = "srEXiWaHuhNyGwPUi444Tu47ZEDwxTWrbQiuD7FmgSAQ6X7Dy"

const createChainInitialState = {
    subnetId: "",
    vmId: EVM_VM_ID,
    chainID: "",
    chainName: "My Chain",
    managerAddress: "0xfacade0000000000000000000000000000000000",
    genesisData: "",
    targetBlockRate: 2,
    gasLimit: 12000000,
    evmChainId: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
    convertToL1TxId: "",
    validatorWeights: Array(100).fill(100) as number[],
    nodePopJsons: [""] as string[],
}

export const useCreateChainStore = create(
    persist(
        combine(createChainInitialState, (set) => ({
            setSubnetID: (subnetId: string) => set({ subnetId }),
            setChainName: (chainName: string) => set({ chainName }),
            setVmId: (vmId: string) => set({ vmId }),
            setChainID: (chainID: string) => set({ chainID }),
            setManagerAddress: (managerAddress: string) => set({ managerAddress }),
            setGenesisData: (genesisData: string) => set({ genesisData }),
            setTargetBlockRate: (targetBlockRate: number) => set({ targetBlockRate }),
            setGasLimit: (gasLimit: number) => set({ gasLimit }),
            setEvmChainId: (evmChainId: number) => set({ evmChainId }),
            setConvertToL1TxId: (convertToL1TxId: string) => set({ convertToL1TxId }),
            setValidatorWeights: (validatorWeights: number[]) => set({ validatorWeights }),
            setNodePopJsons: (nodePopJsons: string[]) => set({ nodePopJsons }),

            reset: () => {
                window?.localStorage.removeItem('create-chain-store');
                window?.location.reload();
            },
        })),
        {
            name: 'create-chain-store',
            storage: createJSONStorage(localStorageComp),
        },
    ),
)

const l1ListState = {
    l1List: [] as { id: string, name: string, rpcUrl: string }[],
    lastSelectedL1: "",
}

export const useL1ListStore = create(
    persist(
        combine(l1ListState, (set) => ({
            addL1: (l1: { id: string, name: string, rpcUrl: string }) => set((state) => ({ l1List: [...state.l1List, l1] })),
            removeL1: (l1: string) => set((state) => ({ l1List: state.l1List.filter((l) => l.id !== l1) })),
            setLastSelectedL1: (l1: string) => set({ lastSelectedL1: l1 }),
        })),
        {
            name: 'l1-list-store',
            storage: createJSONStorage(localStorageComp),
        },
    ),
)

const toolboxInitialState = {
    validatorMessagesLibAddress: "",
    nodeRpcUrl: "",
    evmChainCoinName: "COIN",
    evmChainIsTestnet: true,
    validatorManagerAddress: "",
    proxyAddress: "0xfacade0000000000000000000000000000000000",
    proxyAdminAddress: "0xdad0000000000000000000000000000000000000" as `0x${string}`,
    teleporterRegistryAddress: "",
    icmReceiverAddress: "",
    stakingManagerAddress: "",
    rewardCalculatorAddress: "",
    exampleErc20Address: { "L1": "", "C-Chain": "" } as { L1: string, "C-Chain": string },
    erc20TokenHomeAddress: { "L1": "", "C-Chain": "" } as { L1: string, "C-Chain": string },
    erc20TokenRemoteAddress: { "L1": "", "C-Chain": "" } as { L1: string, "C-Chain": string },
}

export const getToolboxStore = (chainId: string) => create(
    persist(
        combine(toolboxInitialState, (set) => ({
            setStakingManagerAddress: (stakingManagerAddress: string) => set({ stakingManagerAddress }),
            setRewardCalculatorAddress: (rewardCalculatorAddress: string) => set({ rewardCalculatorAddress }),
            setValidatorMessagesLibAddress: (validatorMessagesLibAddress: string) => set({ validatorMessagesLibAddress }),
            setNodeRpcUrl: (nodeRpcUrl: string) => set({ nodeRpcUrl }),
            setEvmChainCoinName: (evmChainCoinName: string) => set({ evmChainCoinName }),
            setEvmChainIsTestnet: (evmChainIsTestnet: boolean) => set({ evmChainIsTestnet }),
            setValidatorManagerAddress: (validatorManagerAddress: string) => set({ validatorManagerAddress }),
            setProxyAddress: (proxyAddress: string) => set({ proxyAddress }),
            setProxyAdminAddress: (proxyAdminAddress: `0x${string}`) => set({ proxyAdminAddress }),
            reset: () => {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem(`toolbox-storage-${chainId}`);
                    window.location.reload();
                }
            },
            setTeleporterRegistryAddress: (address: string) => set({ teleporterRegistryAddress: address }),
            setIcmReceiverAddress: (address: string) => set({ icmReceiverAddress: address }),
            setExampleErc20Address: (address: string, deployOn: DeployOn) => set((state) => ({ exampleErc20Address: { ...state.exampleErc20Address, [deployOn]: address } })),
            setErc20TokenHomeAddress: (address: string, deployOn: DeployOn) => set((state) => ({ erc20TokenHomeAddress: { ...state.erc20TokenHomeAddress, [deployOn]: address } })),
            setErc20TokenRemoteAddress: (address: string, deployOn: DeployOn) => set((state) => ({ erc20TokenRemoteAddress: { ...state.erc20TokenRemoteAddress, [deployOn]: address } })),
        })),
        {
            name: `toolbox-storage-${chainId}`,
            storage: createJSONStorage(localStorageComp),
        },
    ),
)

export const useToolboxStore = () => {
    const { lastSelectedL1 } = useL1ListStore();
    return getToolboxStore(lastSelectedL1)();
}

export function resetAllStores() {
    useCreateChainStore.getState().reset();
    const chainIds = useL1ListStore.getState().l1List.map((l1) => l1.id);
    chainIds.forEach((chainId) => {
        getToolboxStore(chainId).getState().reset();
    });
}

// import { useShallow } from 'zustand/react/shallow'

// export function useViemChainStore() {
//     // Use useShallow to select the primitive state values we need
//     const chainData = useToolboxStore(
//         useShallow((state) => ({
//             evmChainId: state.evmChainId,
//             chainName: state.chainName,
//             evmChainRpcUrl: state.evmChainRpcUrl,
//             evmChainCoinName: state.evmChainCoinName,
//             evmChainIsTestnet: state.evmChainIsTestnet
//         }))
//     );

//     // Create the viemChain object with useMemo to prevent unnecessary recreation
//     const viemChain = useMemo(() => {
//         const { evmChainId, chainName, evmChainRpcUrl, evmChainCoinName, evmChainIsTestnet } = chainData;

//         if (!evmChainId || !evmChainRpcUrl) {
//             return null;
//         }

//         return {
//             id: evmChainId,
//             name: chainName || `Chain #${evmChainId}`,
//             rpcUrls: {
//                 default: { http: [evmChainRpcUrl] },
//             },
//             nativeCurrency: {
//                 name: evmChainCoinName || chainName + " Coin",
//                 symbol: evmChainCoinName || chainName + " Coin",
//                 decimals: 18
//             },
//             isTestnet: evmChainIsTestnet,
//         };
//     }, [chainData]);

//     return viemChain;
// }

