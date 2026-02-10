import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AutoPaymentSettings {
  enabled: boolean;
  interval: number;
  lastCheck?: string;
  apiKey?: string;
}

interface DiscordSettings {
  enabled: boolean;
  webhookUrl: string;
  notifyOnManual: boolean;
  notifyOnApiCheck: boolean;
  notifyOnMovementDetected: boolean;
  minChangeThreshold: number;
}

interface SettingsStore {
  // UI Settings
  devMode: boolean;
  testMode: boolean;
  theme: 'light' | 'dark';
  syncEnabled: boolean;
  workspaceId: string;
  bankPin: string; // Added PIN field
  
  // Auto Payment
  autoPaymentSettings: AutoPaymentSettings;
  
  // Discord Notifications
  discordSettings: DiscordSettings;
  
  // Order Number Settings
  orderPrefix: string;
  orderDigits: number;
  orderCounter: number;
  
  // Tab Visibility
  visibleTabs: string[];
  
  // Actions
  setDevMode: (enabled: boolean) => void;
  setTestMode: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAutoPaymentSettings: (settings: Partial<AutoPaymentSettings>) => void;
  setDiscordSettings: (settings: Partial<DiscordSettings>) => void;
  setOrderSettings: (settings: { prefix?: string; digits?: number; counter?: number }) => void;
  setVisibleTabs: (tabs: string[]) => void;
  toggleTabVisibility: (tabId: string) => void;
  setSyncEnabled: (enabled: boolean) => void;
  setWorkspaceId: (id: string) => void;
  setBankPin: (pin: string) => void; // Added action
  
  replaceState: (newState: Partial<SettingsStore>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Default values
      devMode: false,
      testMode: false,
      theme: 'dark',
      syncEnabled: true,
      workspaceId: 'global',
      bankPin: '', // Empty means no PIN
      
      autoPaymentSettings: {
        enabled: false,
        interval: 600000, // 10 minutes
      },
      
      discordSettings: {
        enabled: false,
        webhookUrl: '',
        notifyOnManual: true,
        notifyOnApiCheck: false,
        notifyOnMovementDetected: true,
        minChangeThreshold: 1,
      },
      
      orderPrefix: 'SD',
      orderDigits: 4,
      orderCounter: 1145,
      
      visibleTabs: [
        'dashboard',
        'orders',
        'invoices',
        'delivery',
        'inventory',
        'bank',
        'employees',
        'archive',
        'calculator',
        'settings'
      ],
      
      setDevMode: (enabled) => {
        set({ devMode: enabled });
      },
      
      setTestMode: (enabled) => {
        set({ testMode: enabled });
      },
      
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      setAutoPaymentSettings: (settings) => {
        set((state) => ({
          autoPaymentSettings: {
            ...state.autoPaymentSettings,
            ...settings
          }
        }));
      },
      
      setDiscordSettings: (settings) => {
        set((state) => ({
          discordSettings: {
            ...state.discordSettings,
            ...settings
          }
        }));
      },
      
      setOrderSettings: (settings) => {
        set((state) => ({
          orderPrefix: settings.prefix ?? state.orderPrefix,
          orderDigits: settings.digits ?? state.orderDigits,
          orderCounter: settings.counter ?? state.orderCounter
        }));
      },
      
      setVisibleTabs: (tabs) => {
        set({ visibleTabs: tabs });
      },
      
      toggleTabVisibility: (tabId) => {
        set((state) => {
          const isVisible = state.visibleTabs.includes(tabId);
          return {
            visibleTabs: isVisible
              ? state.visibleTabs.filter(id => id !== tabId)
              : [...state.visibleTabs, tabId]
          };
        });
      },
      
      setSyncEnabled: (enabled) => {
        set({ syncEnabled: enabled });
      },
      
      setWorkspaceId: (id) => {
        set({ workspaceId: id });
      },
      
      setBankPin: (pin) => {
        set({ bankPin: pin });
      },
      
      replaceState: (newState) => {
        set((state) => ({ ...state, ...newState }));
        if (newState.theme && typeof window !== 'undefined') {
          if (newState.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    }),
    {
      name: 'schmelzdepot-core-settings',
      partialize: (state) => ({
        // ONLY persist these three values to allow the app to boot into the correct workspace
        workspaceId: state.workspaceId,
        theme: state.theme,
        syncEnabled: state.syncEnabled,
      }),
    }
  )
);