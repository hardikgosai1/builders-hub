import { create } from 'zustand'
import { persist, createJSONStorage, combine } from 'zustand/middleware'
import { stepList } from './stepList'

export const initialState = {
    subnetID: "",
    stepsCurrentStep: Object.keys(stepList)[0],
    stepsMaxStep: Object.keys(stepList)[0],
    l1Name: "",
    evmChainId: Math.floor(Math.random() * (1000000 - 100000 + 1)) + 100000,
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

