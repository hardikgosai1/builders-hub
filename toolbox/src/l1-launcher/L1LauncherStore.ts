import { create } from 'zustand'
import { persist, createJSONStorage, combine } from 'zustand/middleware'
import { stepList } from './stepList'

export const initialState = {
    subnetID: "",
    stepsCurrentStep: Object.keys(stepList)[0],
}

export const useL1LauncherStore = create(
    persist(
        combine(initialState, (set) => ({
            setSubnetID: (subnetID: string) => set({ subnetID }),
            setStepsCurrentStep: (stepsCurrentStep: string) => set({ stepsCurrentStep }),
            reset: () => {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('example-storage');
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

