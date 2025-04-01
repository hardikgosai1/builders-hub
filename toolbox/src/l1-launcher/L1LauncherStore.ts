import { create } from 'zustand'
import { persist, createJSONStorage, combine } from 'zustand/middleware'
import { stepList } from './stepList'
import { AllowlistPrecompileConfig, generateEmptyAllowlistPrecompileConfig } from '../components/genesis/types'
import generateName from 'boring-name-generator'

export interface AllocationEntry {
    address: string;
    amount: number;
}

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
    txAllowlistConfig: generateEmptyAllowlistPrecompileConfig(),
    contractDeployerAllowlistConfig: generateEmptyAllowlistPrecompileConfig()
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
            setTxAllowlistConfig: (txAllowlistConfig: AllowlistPrecompileConfig) => set({ txAllowlistConfig }),
            setContractDeployerAllowlistConfig: (contractDeployerAllowlistConfig: AllowlistPrecompileConfig) => set({ contractDeployerAllowlistConfig }),

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

