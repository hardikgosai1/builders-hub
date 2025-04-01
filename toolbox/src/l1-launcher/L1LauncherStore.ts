import { create } from 'zustand'
import { persist, createJSONStorage, combine } from 'zustand/middleware'
import { stepList } from './stepList'
import { AllocationEntry, AllowlistPrecompileConfig, generateEmptyAllowlistPrecompileConfig } from '../components/genesis/types'
import generateName from 'boring-name-generator'



const generateRandomName = () => {
    //makes sure the name doesn't contain a dash
    const firstLetterUppercase = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
    for (let i = 0; i < 1000; i++) {
        const randomName = generateName({ words: 3 }).raw.map(firstLetterUppercase).join(' ');
        if (!randomName.includes('-')) return randomName;
    }
    throw new Error("Could not generate a name with a dash after 1000 attempts");
}

export const initialState = {
    chainId: "",
    evmChainId: Math.floor(Math.random() * (1000000 - 100000 + 1)) + 100000,
    evmTokenSymbol: "",
    genesisContractDeployerAllowlistConfig: generateEmptyAllowlistPrecompileConfig(),
    genesisNativeMinterAllowlistConfig: generateEmptyAllowlistPrecompileConfig(),
    genesisString: "",
    genesisTxAllowlistConfig: generateEmptyAllowlistPrecompileConfig(),
    evmChainName: (generateRandomName() + " L1"),
    nodesCount: 1,
    poaOwnerAddress: "",
    stepsCurrentStep: Object.keys(stepList)[0],
    stepsMaxStep: Object.keys(stepList)[0],
    subnetId: "",
    tokenAllocations: [] as AllocationEntry[],
}

export const useL1LauncherStore = create(
    persist(
        combine(initialState, (set, get) => ({
            setChainId: (chainId: string) => set({ chainId }),
            setEvmChainId: (evmChainId: number) => set({ evmChainId }),
            setEvmTokenSymbol: (evmTokenSymbol: string) => set({ evmTokenSymbol }),
            setGenesisContractDeployerAllowlistConfig: (genesisContractDeployerAllowlistConfig: AllowlistPrecompileConfig) => set({ genesisContractDeployerAllowlistConfig }),
            setGenesisNativeMinterAllowlistConfig: (genesisNativeMinterAllowlistConfig: AllowlistPrecompileConfig) => set({ genesisNativeMinterAllowlistConfig }),
            setGenesisString: (genesisString: string) => set({ genesisString }),
            setGenesisTxAllowlistConfig: (genesisTxAllowlistConfig: AllowlistPrecompileConfig) => set({ genesisTxAllowlistConfig }),
            setEvmChainName: (evmChainName: string) => set({ evmChainName }),
            setNodesCount: (nodesCount: number) => set({ nodesCount }),
            setPoaOwnerAddress: (poaOwnerAddress: string) => set({ poaOwnerAddress }),
            setSubnetID: (subnetId: string) => set({ subnetId }),
            setTokenAllocations: (tokenAllocations: AllocationEntry[]) => set({ tokenAllocations }),

            setStepsCurrentStep: (stepsCurrentStep: string) => {
                set({ stepsCurrentStep })
                const stepsMaxStep = get().stepsMaxStep;
                const currentStepIndex = Object.keys(stepList).indexOf(stepsCurrentStep);
                const maxStepIndex = Object.keys(stepList).indexOf(stepsMaxStep);
                if (currentStepIndex > maxStepIndex) {
                    set({ stepsMaxStep: stepsCurrentStep })
                }
            },
            reset: () => {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('l1-launcher-storage');
                    window.location.reload();
                }
            },
        })),
        {
            name: 'l1-launcher-storage',
            storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { }
            }),
        },
    ),
)

