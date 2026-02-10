import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useInventoryStore } from './store/inventoryStore';
import { useCalculatorStore } from './store/calculatorStore';
import { useOrderStore } from './store/orderStore';
import { useInvoiceStore } from './store/invoiceStore';
import { useBankStore } from './store/bankStore';
import { useEmployeeStore } from './store/employeeStore';
import { useSettingsStore } from './store/settingsStore';
import { useTabVisibilityStore } from './store/tabVisibilityStore';
import { useTransportOrderStore } from './store/transportOrderStore';
import { useContractStore } from './store/contractStore';

const SYNC_INTERVAL = 5000; // 5 seconds for aggressive live sync
const DEBOUNCE_DELAY = 500; // 0.5 seconds for rapid updates

// Generate a session-specific client ID to avoid sync loops
const clientId = Math.random().toString(36).substring(2, 15);

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-002fdd94`;

const stores = [
  { name: 'inventory', useStore: useInventoryStore, key: 'sd_inventory' },
  { name: 'calculator', useStore: useCalculatorStore, key: 'sd_calculator' },
  { name: 'orders', useStore: useOrderStore, key: 'sd_orders' },
  { name: 'invoices', useStore: useInvoiceStore, key: 'sd_invoices' },
  { name: 'bank', useStore: useBankStore, key: 'sd_bank' },
  { name: 'employees', useStore: useEmployeeStore, key: 'sd_employees' },
  { name: 'settings', useStore: useSettingsStore, key: 'sd_settings' },
  { name: 'tabs', useStore: useTabVisibilityStore, key: 'sd_tabs' },
  { name: 'transport', useStore: useTransportOrderStore, key: 'sd_transport' },
  { name: 'contracts', useStore: useContractStore, key: 'sd_contracts' },
];

export default function LiveSyncManager({ syncTrigger = 0 }: { syncTrigger?: number }) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const syncEnabled = useSettingsStore(state => state.syncEnabled);
  const workspaceId = useSettingsStore(state => state.workspaceId);
  const isSyncingFromRemote = useRef(false);
  const isInitialLoad = useRef(true);
  const debounceTimers = useRef<{ [key: string]: any }>({});
  const lastSyncPayloads = useRef<{ [key: string]: string }>({});

  const pushToRemote = useCallback(async (storeName: string, key: string, data: any) => {
    // Stringify and compare to avoid redundant pushes
    const stringified = JSON.stringify(data);
    if (lastSyncPayloads.current[key] === stringified) return;

    if (!navigator.onLine || !syncEnabled) return;

    try {
      const response = await fetch(`${baseUrl}/sync/${key}?workspace=${workspaceId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          data,
          clientId,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        lastSyncPayloads.current[key] = stringified;
        setLastSync(new Date());
      } else {
        const errorText = await response.text();
        console.warn(`[Sync] Push failed for ${storeName} (${response.status}):`, errorText);
      }
    } catch (err) {
      // Silent error for connection issues
      if (!(err instanceof TypeError)) {
        console.error(`[Sync] Error pushing ${storeName}:`, err);
      }
    }
  }, [workspaceId, syncEnabled]);

  const pullFromRemote = useCallback(async () => {
    if (!syncEnabled || !navigator.onLine) return;
    
    // Check if we have valid Supabase config
    if (!projectId || projectId.length < 5) {
      return;
    }

    setSyncStatus('syncing');

    try {
      // Direct pull attempt with CORS mode
      for (const store of stores) {
        const response = await fetch(`${baseUrl}/sync/${store.key}?workspace=${workspaceId}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const remote = result.data;

          if (remote) {
            const remoteDataStr = JSON.stringify(remote.data);
            const localDataStr = JSON.stringify(store.useStore.getState());

            if (remoteDataStr !== localDataStr && remote.clientId !== clientId) {
              console.log(`[Sync] Updating local ${store.name} from remote...`);
              isSyncingFromRemote.current = true;
              store.useStore.getState().replaceState(remote.data);
              lastSyncPayloads.current[store.key] = remoteDataStr;
              setLastSync(new Date());
              
              // Notification removed as requested
              
              setTimeout(() => { isSyncingFromRemote.current = false; }, 500);
            }
          }
        }
      }
      
      setSyncStatus('success');
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        // Toast removed as requested
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        // This is often a temporary network glitch or sleeping server
        setSyncStatus('idle');
      } else {
        console.error('[Sync] Pull error:', err);
        setSyncStatus('error');
      }
    }
  }, [syncEnabled, workspaceId]);

  // Subscribe to local store changes
  useEffect(() => {
    if (!syncEnabled) return;

    const unsubscribes = stores.map(store => {
      return store.useStore.subscribe((state) => {
        if (isSyncingFromRemote.current) return;

        // Debounce the push
        if (debounceTimers.current[store.key]) {
          clearTimeout(debounceTimers.current[store.key]);
        }

        debounceTimers.current[store.key] = setTimeout(() => {
          pushToRemote(store.name, store.key, state);
        }, DEBOUNCE_DELAY);
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
      Object.values(debounceTimers.current).forEach(t => clearTimeout(t));
    };
  }, [pushToRemote, syncEnabled]);

  // Initial pull and interval
  useEffect(() => {
    if (!syncEnabled) {
      setSyncStatus('idle');
      return;
    }

    // Pull immediately on focus/visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Sync] Visibility change: pulling data...');
        pullFromRemote();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Initial pull
    pullFromRemote();

    const interval = setInterval(() => {
      pullFromRemote();
    }, SYNC_INTERVAL);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [pullFromRemote, syncEnabled]);

  // Effect for manual trigger
  useEffect(() => {
    if (syncTrigger > 0 && syncEnabled) {
      console.log('[Sync] Manual trigger: pulling data...');
      pullFromRemote();
    }
  }, [syncTrigger, pullFromRemote, syncEnabled]);

  return null; // Logic-only component
}