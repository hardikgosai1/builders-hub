import { create } from 'zustand'
import { persist, createJSONStorage, combine } from 'zustand/middleware'
import { stepList } from './stepList'
import { AllowlistPrecompileConfig, generateEmptyAllowlistPrecompileConfig } from '../components/genesis/types'
import generateName from 'boring-name-generator'

export interface AllocationEntry {
    address: string;
    amount: number;
}

function randomTicker(length: number) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
}

export const initialState = {
    subnetID: "",
    stepsCurrentStep: Object.keys(stepList)[0],
    stepsMaxStep: Object.keys(stepList)[0],
    l1Name: (generateName().spaced.split('-').join(' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + " L1"),
    evmChainId: Math.floor(Math.random() * (1000000 - 100000 + 1)) + 100000,
    evmTokenSymbol: randomTicker(4),
    tokenAllocations: [] as AllocationEntry[],
    genesisNativeMinterAllowlistConfig: generateEmptyAllowlistPrecompileConfig()
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

