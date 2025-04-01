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
    subnetID: "",
    stepsCurrentStep: Object.keys(stepList)[0],
    stepsMaxStep: Object.keys(stepList)[0],
    l1Name: (generateRandomName() + " L1"),
    evmChainId: Math.floor(Math.random() * (1000000 - 100000 + 1)) + 100000,
    evmTokenSymbol: "",
    tokenAllocations: [] as AllocationEntry[],
    genesisNativeMinterAllowlistConfig: generateEmptyAllowlistPrecompileConfig(),
    poaOwnerAddress: "",
    genesisTxAllowlistConfig: generateEmptyAllowlistPrecompileConfig(),
    genesisContractDeployerAllowlistConfig: generateEmptyAllowlistPrecompileConfig(),
    genesisString: "",
}

export const useL1LauncherStore = create(
    persist(
        combine(initialState, (set, get) => ({
            setSubnetID: (subnetID: string) => set({ subnetID }),
            setStepsCurrentStep: (stepsCurrentStep: string) => {
                set({ stepsCurrentStep })
                const stepsMaxStep = get().stepsMaxStep;
                const currentStepIndex = Object.keys(stepList).indexOf(stepsCurrentStep);
                const maxStepIndex = Object.keys(stepList).indexOf(stepsMaxStep);
                if (currentStepIndex > maxStepIndex) {
                    set({ stepsMaxStep: stepsCurrentStep })
                }
            },
            setL1Name: (l1Name: string) => set({ l1Name }),
            setEvmChainId: (evmChainId: number) => set({ evmChainId }),
            setEvmTokenSymbol: (evmTokenSymbol: string) => set({ evmTokenSymbol }),
            setTokenAllocations: (tokenAllocations: AllocationEntry[]) => set({ tokenAllocations }),
            setGenesisNativeMinterAllowlistConfig: (genesisNativeMinterAllowlistConfig: AllowlistPrecompileConfig) => set({ genesisNativeMinterAllowlistConfig }),
            setPoaOwnerAddress: (poaOwnerAddress: string) => set({ poaOwnerAddress }),
            setGenesisTxAllowlistConfig: (genesisTxAllowlistConfig: AllowlistPrecompileConfig) => set({ genesisTxAllowlistConfig }),
            setGenesisContractDeployerAllowlistConfig: (genesisContractDeployerAllowlistConfig: AllowlistPrecompileConfig) => set({ genesisContractDeployerAllowlistConfig }),
            setGenesisString: (genesisString: string) => set({ genesisString }),

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

