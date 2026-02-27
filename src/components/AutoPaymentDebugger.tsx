import { Card } from './ui/card';

export function AutoPaymentDebugger() {
  const logs = JSON.parse(localStorage.getItem('autopayment-debug-logs') || '[]');
  
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Debug-Logs für automatische Zahlungsverarbeitung
      </div>
      
      <div className="max-h-[300px] overflow-y-auto border rounded-lg p-4 bg-muted/20 space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Debug-Logs verfügbar</p>
        ) : (
          logs.slice(-20).reverse().map((log: any, idx: number) => (
            <div key={idx} className="text-xs font-mono p-2 bg-card rounded border">
              <span className="text-muted-foreground">{log.timestamp}</span>
              <span className="ml-2">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
