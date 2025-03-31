import { create } from 'zustand'
import { persist, createJSONStorage, combine } from 'zustand/middleware'

export const initialState = {
    subnetID: "",
}

export const useToolboxStore = create(
    persist(
        combine(initialState, (set) => ({
            setSubnetID: (subnetID: string) => set({ subnetID }),
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
