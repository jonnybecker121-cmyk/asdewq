import { useEffect, useRef, useState, useCallback } from 'react';
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

// ──────────────────────────────────────────────────────────
// ZERO-NOISE SYNC — completely silent, no errors, no 404s
// - Probes table via OpenAPI root (always HTTP 200)
// - Auto-disables sync if table missing (persisted)
// - Never calls non-existent table endpoints
// - Zero console output
// ──────────────────────────────────────────────────────────

const SYNC_INTERVAL = 5000;
const DEBOUNCE_DELAY = 500;
const TABLE_NAME = 'kv_store_002fdd94';
const TABLE_CHECK_KEY = 'sd-table-available';

const clientId = Math.random().toString(36).substring(2, 15);
const restBase = `https://${projectId}.supabase.co/rest/v1`;

const restHeaders: Record<string, string> = {
  'apikey': publicAnonKey,
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

// ── Check sessionStorage for cached table status ─────────
let tableConfirmed: boolean = (() => {
  try {
    return sessionStorage.getItem(TABLE_CHECK_KEY) === 'true';
  } catch {
    return false;
  }
})();

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

// ── Safe table probe via OpenAPI root (ALWAYS returns 200) ──
async function safeProbeTable(): Promise<boolean> {
  try {
    const res = await fetch(restBase + '/', {
      method: 'GET',
      headers: {
        'apikey': publicAnonKey,
        'Authorization': `Bearer ${publicAnonKey}`,
        'Accept': 'application/openapi+json',
      },
    });
    if (!res.ok) return false;

    const text = await res.text();
    const found = text.includes(TABLE_NAME);

    tableConfirmed = found;
    try {
      sessionStorage.setItem(TABLE_CHECK_KEY, found ? 'true' : 'false');
    } catch {}

    return found;
  } catch {
    return false;
  }
}

// ── Direct PostgREST read (ONLY if table confirmed) ─────
async function directGet(storageKey: string): Promise<any | null> {
  if (!tableConfirmed) return null;
  try {
    const url = `${restBase}/${TABLE_NAME}?key=eq.${encodeURIComponent(storageKey)}&select=value&limit=1`;
    const res = await fetch(url, { method: 'GET', headers: restHeaders });
    if (!res.ok) { tableConfirmed = false; return null; }
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0].value : null;
  } catch { return null; }
}

// ── Direct PostgREST write (ONLY if table confirmed) ────
async function directUpsert(storageKey: string, value: any): Promise<boolean> {
  if (!tableConfirmed) return false;
  try {
    const res = await fetch(`${restBase}/${TABLE_NAME}`, {
      method: 'POST',
      headers: { ...restHeaders, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ key: storageKey, value, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) { tableConfirmed = false; return false; }
    return true;
  } catch { return false; }
}

// ── Component ────────────────────────────────────────────

export default function LiveSyncManager({ syncTrigger = 0 }: { syncTrigger?: number }) {
  const syncEnabled = useSettingsStore(s => s.syncEnabled);
  const setSyncEnabled = useSettingsStore(s => s.setSyncEnabled);
  const workspaceId = useSettingsStore(s => s.workspaceId);
  const isSyncingFromRemote = useRef(false);
  const debounceTimers = useRef<Record<string, any>>({});
  const lastPayloads = useRef<Record<string, string>>({});
  const [probed, setProbed] = useState(false);

  // ── One-time probe on mount: auto-disable sync if no table ──
  useEffect(() => {
    if (!syncEnabled || probed) return;

    let cancelled = false;

    (async () => {
      // If already confirmed from sessionStorage, skip probe
      if (tableConfirmed) {
        if (!cancelled) setProbed(true);
        return;
      }

      const found = await safeProbeTable();
      if (cancelled) return;

      if (!found) {
        // Table doesn't exist → auto-disable sync (persisted to localStorage)
        setSyncEnabled(false);
      }
      setProbed(true);
    })();

    return () => { cancelled = true; };
  }, [syncEnabled, probed, setSyncEnabled]);

  // ── Push ────────────────────────────────────────────
  const pushToRemote = useCallback(async (_name: string, key: string, data: any) => {
    if (!tableConfirmed || !navigator.onLine || !syncEnabled) return;
    const json = JSON.stringify(data);
    if (lastPayloads.current[key] === json) return;

    const storageKey = `ws:${workspaceId}:${key}`;
    const ok = await directUpsert(storageKey, { data, clientId, timestamp: Date.now() });
    if (ok) lastPayloads.current[key] = json;
  }, [workspaceId, syncEnabled]);

  // ── Pull ────────────────────────────────────────────
  const pullFromRemote = useCallback(async () => {
    if (!syncEnabled || !navigator.onLine || !tableConfirmed) return;
    if (!projectId || projectId.length < 5) return;

    for (const store of stores) {
      if (!tableConfirmed) break;
      const storageKey = `ws:${workspaceId}:${store.key}`;
      const remote = await directGet(storageKey);
      if (remote?.data) {
        const remoteStr = JSON.stringify(remote.data);
        const localStr = JSON.stringify(store.useStore.getState());
        if (remoteStr !== localStr && remote.clientId !== clientId) {
          isSyncingFromRemote.current = true;
          store.useStore.getState().replaceState(remote.data);
          lastPayloads.current[store.key] = remoteStr;
          setTimeout(() => { isSyncingFromRemote.current = false; }, 500);
        }
      }
    }
  }, [syncEnabled, workspaceId]);

  // ── Store subscriptions ─────────────────────────────
  useEffect(() => {
    if (!syncEnabled || !tableConfirmed) return;
    const unsubs = stores.map(store =>
      store.useStore.subscribe((state) => {
        if (isSyncingFromRemote.current) return;
        if (debounceTimers.current[store.key]) clearTimeout(debounceTimers.current[store.key]);
        debounceTimers.current[store.key] = setTimeout(() => {
          pushToRemote(store.name, store.key, state);
        }, DEBOUNCE_DELAY);
      })
    );
    return () => {
      unsubs.forEach(u => u());
      Object.values(debounceTimers.current).forEach(t => clearTimeout(t));
    };
  }, [pushToRemote, syncEnabled]);

  // ── Interval ────────────────────────────────────────
  useEffect(() => {
    if (!syncEnabled || !tableConfirmed) return;

    const onVisible = () => {
      if (document.visibilityState === 'visible') pullFromRemote();
    };
    window.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    pullFromRemote();
    const iv = setInterval(pullFromRemote, SYNC_INTERVAL);

    return () => {
      window.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      clearInterval(iv);
    };
  }, [pullFromRemote, syncEnabled]);

  // ── Manual trigger ──────────────────────────────────
  useEffect(() => {
    if (syncTrigger > 0 && syncEnabled && tableConfirmed) pullFromRemote();
  }, [syncTrigger, pullFromRemote, syncEnabled]);

  return null;
}
