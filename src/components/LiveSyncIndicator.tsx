import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Database } from 'lucide-react';

/**
 * Live-Sync Status Indicator
 * Zeigt den aktuellen Sync-Status an
 * - On-Demand Mode (kein Auto-Polling)
 */
export function LiveSyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 gap-1.5 px-2">
        <WifiOff className="h-3 w-3" />
        <span className="text-[10px]">OFFLINE</span>
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className="border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1.5 px-2"
      title="On-Demand Sync: Änderungen sofort gespeichert, Updates bei Tab-Wechsel oder 'Neu laden'"
    >
      <Database className="h-3 w-3" />
      <span className="text-[10px]">DB</span>
    </Badge>
  );
}
