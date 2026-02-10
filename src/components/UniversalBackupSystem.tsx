import { useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { useInventoryStore } from './store/inventoryStore';
import { useCalculatorStore } from './store/calculatorStore';
import { useOrderStore } from './store/orderStore';
import { useInvoiceStore } from './store/invoiceStore';
import { useBankStore } from './store/bankStore';
import { useEmployeeStore } from './store/employeeStore';
import { useSettingsStore } from './store/settingsStore';
import { useTabVisibilityStore } from './store/tabVisibilityStore';

interface UniversalBackupSystemProps {
  enabled?: boolean;
  activeView?: string;
  backupIntervalMinutes?: number;
}

interface BackupSnapshot {
  timestamp: number;
  date: string;
  type: 'daily' | 'manual';
  data: {
    [key: string]: any;
  };
}

const BACKUP_STORAGE_KEY = 'schmelzdepot-local-backups';
const MAX_BACKUPS = 10;

const stores = [
  { name: 'inventory', useStore: useInventoryStore, key: 'sd_inventory' },
  { name: 'calculator', useStore: useCalculatorStore, key: 'sd_calculator' },
  { name: 'orders', useStore: useOrderStore, key: 'sd_orders' },
  { name: 'invoices', useStore: useInvoiceStore, key: 'sd_invoices' },
  { name: 'bank', useStore: useBankStore, key: 'sd_bank' },
  { name: 'employees', useStore: useEmployeeStore, key: 'sd_employees' },
  { name: 'settings', useStore: useSettingsStore, key: 'sd_settings' },
  { name: 'tabs', useStore: useTabVisibilityStore, key: 'sd_tabs' },
];

export default function UniversalBackupSystem() {
  const [enabled] = useState(true);
  const [backupIntervalMinutes] = useState(240); // 4 hours

  // Collect all data from Zustand stores
  const collectAllUserData = (): BackupSnapshot['data'] => {
    const data: BackupSnapshot['data'] = {};
    stores.forEach(store => {
      data[store.key] = store.useStore.getState();
    });
    
    return data;
  };

  const createBackup = (type: 'daily' | 'manual' = 'manual') => {
    try {
      const now = Date.now();
      const data = collectAllUserData();
      
      const snapshot: BackupSnapshot = {
        timestamp: now,
        date: new Date().toISOString(),
        type,
        data
      };
      
      // Save to local storage history (Metadaten über Backups)
      const existingStr = localStorage.getItem(BACKUP_STORAGE_KEY);
      let backups: BackupSnapshot[] = existingStr ? JSON.parse(existingStr) : [];
      
      backups.push(snapshot);
      
      // Keep only last MAX_BACKUPS
      if (backups.length > MAX_BACKUPS) {
        backups = backups.slice(backups.length - MAX_BACKUPS);
      }
      
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
      
      if (type === 'manual') {
        toast.success('Snapshot erstellt', { description: 'Aktuelle Cloud-Daten wurden lokal im Browser-Verlauf gesichert.' });
      }
      
      return snapshot;
    } catch (e) {
      console.error('Backup failed', e);
      toast.error('Snapshot fehlgeschlagen');
    }
  };

  const downloadBackup = () => {
    const snapshot = createBackup('manual');
    if (!snapshot) return;
    
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schmelzdepot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup heruntergeladen');
  };

  const restoreBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const snapshot: BackupSnapshot = JSON.parse(content);
        
        if (!snapshot.data) throw new Error('Ungültiges Backup-Format');
        
        // Restore to stores
        stores.forEach(store => {
          if (snapshot.data[store.key]) {
            console.log(`[Backup] Restoring ${store.name}...`);
            store.useStore.getState().replaceState(snapshot.data[store.key]);
          }
        });
        
        toast.success('Snapshot geladen', { description: 'Daten wurden in die aktuelle Sitzung geladen und werden mit der Cloud synchronisiert.' });
        
      } catch (err) {
        console.error(err);
        toast.error('Wiederherstellung fehlgeschlagen', { description: 'Ungültige Datei' });
      }
    };
    reader.readAsText(file);
  };

  // Auto-Backup Interval
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(() => {
      createBackup('daily');
    }, backupIntervalMinutes * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [enabled, backupIntervalMinutes]);

  // Expose functions globally for debugging or manual trigger via console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).backupSystem = {
        createBackup,
        downloadBackup,
        restoreBackup: (json: string) => restoreBackup(new File([json], "restore.json"))
      };
    }
  }, []);

  return null; // This component is logic-only, but could render UI if needed.
}