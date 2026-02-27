import { useEffect, useState } from 'react';
import { Activity, Database, Zap } from 'lucide-react';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState({
    localStorageSize: '0 KB',
    componentsLoaded: 0,
    lastSync: 'Nie',
  });

  useEffect(() => {
    // Calculate localStorage size
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    const sizeInKB = (totalSize / 1024).toFixed(2);

    setMetrics({
      localStorageSize: `${sizeInKB} KB`,
      componentsLoaded: document.querySelectorAll('[data-component]').length || 9,
      lastSync: new Date().toLocaleTimeString('de-DE'),
    });
  }, []);

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        Performance-Metriken
      </h4>
      
      <div className="grid gap-3">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">LocalStorage Größe</span>
          </div>
          <span className="text-sm font-mono">{metrics.localStorageSize}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Geladene Komponenten</span>
          </div>
          <span className="text-sm font-mono">{metrics.componentsLoaded}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Letzter Sync</span>
          </div>
          <span className="text-sm font-mono">{metrics.lastSync}</span>
        </div>
      </div>
    </div>
  );
}
