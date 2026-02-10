import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TabVisibilityStore {
  hiddenTabs: string[];
  toggleTabVisibility: (tabId: string) => void;
  isTabVisible: (tabId: string) => boolean;
  resetTabVisibility: () => void;
  replaceState: (newState: Partial<TabVisibilityStore>) => void;
}

export const useTabVisibilityStore = create<TabVisibilityStore>()(
  (set, get) => ({
    hiddenTabs: [],
    
    toggleTabVisibility: (tabId: string) =>
      set((state) => {
        const isHidden = state.hiddenTabs.includes(tabId);
        return {
          hiddenTabs: isHidden
            ? state.hiddenTabs.filter((id) => id !== tabId)
            : [...state.hiddenTabs, tabId],
        };
      }),
    
    isTabVisible: (tabId: string) => {
      const { hiddenTabs } = get();
      return !hiddenTabs.includes(tabId);
    },
    
    resetTabVisibility: () => set({ hiddenTabs: [] }),
    
    replaceState: (newState) => {
      set((state) => ({ ...state, ...newState }));
    }
  })
);