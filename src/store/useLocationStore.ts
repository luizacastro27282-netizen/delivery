import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  state: string | null;
  city: string | null;
  hasSelectedLocation: boolean;
  
  // Actions
  setLocation: (state: string, city: string) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      state: null,
      city: null,
      hasSelectedLocation: false,

      setLocation: (state, city) => {
        set({ state, city, hasSelectedLocation: true });
      },

      clearLocation: () => {
        set({ state: null, city: null, hasSelectedLocation: false });
      }
    }),
    {
      name: 'pizza-location-storage'
    }
  )
);

