import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { discordNotifier } from '../services/discordNotifier';

export interface InventoryLogEntry {
  id: string;
  timestamp: string;
  type: 'manual' | 'api_check' | 'movement_detected';
  category: 'gold' | 'silver' | 'item' | 'maschine';
  item: string;
  change: number;
  previousQuantity: number;
  newQuantity: number;
  details?: string;
}

export interface ApiSnapshot {
  timestamp: string;
  gold: Array<{ name: string; quantity: number }>;
  silver: Array<{ name: string; quantity: number }>;
  items: Array<{ name: string; quantity: number }>;
  machines: Array<{ name: string; quantity: number }>;
}

interface InventoryStore {
  logs: InventoryLogEntry[];
  lastSnapshot: ApiSnapshot | null;
  
  addLog: (log: Omit<InventoryLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  updateSnapshot: (snapshot: ApiSnapshot) => void;
  clearSnapshot: () => void;
  
  replaceState: (newState: Partial<InventoryStore>) => void;
}

const generateId = () => `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useInventoryStore = create<InventoryStore>()(
  (set, get) => ({
    logs: [],
    lastSnapshot: null,
    
    addLog: (log) => {
      const newLog: InventoryLogEntry = {
        ...log,
        id: generateId(),
        timestamp: new Date().toISOString()
      };
      
      set((state) => {
        // Keep only last 1000 entries
        const newLogs = [...state.logs, newLog].slice(-1000);
        return { logs: newLogs };
      });
      
      // Send Discord notification (optional)
      if (typeof window !== 'undefined') {
        import('./settingsStore').then(({ useSettingsStore }) => {
          const discordSettings = useSettingsStore.getState().discordSettings;
          if (discordSettings.enabled) {
             discordNotifier.sendInventoryNotification(newLog, discordSettings).catch(err => {
               console.error('[Discord] Notification error:', err);
             });
          }
        });
      }
    },
    
    clearLogs: () => {
      set({ logs: [], lastSnapshot: null });
    },
    
    updateSnapshot: (snapshot) => {
      set({ lastSnapshot: snapshot });
    },
    
    clearSnapshot: () => {
      set({ lastSnapshot: null });
    },
    
    replaceState: (newState) => {
      set((state) => ({ ...state, ...newState }));
    }
  })
);