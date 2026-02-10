import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Timer,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useSettingsStore } from './store/settingsStore';

export function PaymentStatusIndicator() {
  const { 
    autoPaymentSettings: settings, 
    setAutoPaymentSettings: updateSettings 
  } = useSettingsStore();
  const [nextCheckIn, setNextCheckIn] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!settings?.enabled) {
      setNextCheckIn(0);
      setIsActive(false);
      return;
    }

    setIsActive(true);
    
    // Calculate time until next check
    const updateTimer = () => {
      if (settings?.lastCheck) {
        const lastCheck = new Date(settings.lastCheck);
        const nextCheck = new Date(lastCheck.getTime() + (settings?.interval || 600000));
        const now = new Date();
        const remaining = Math.max(0, nextCheck.getTime() - now.getTime());
        setNextCheckIn(remaining);
      } else {
        // First check in 10 seconds
        setNextCheckIn(10000);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [settings?.enabled, settings?.interval, settings?.lastCheck]);

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return 'Prüfe jetzt...';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getStatusColor = () => {
    if (!settings?.enabled) return 'secondary';
    if (nextCheckIn <= 10000) return 'default'; // Checking soon
    return 'outline';
  };

  const getStatusIcon = () => {
    if (!settings?.enabled) return <Pause className="h-3 w-3" />;
    if (nextCheckIn <= 10000) return <Timer className="h-3 w-3 animate-pulse" />;
    return <CheckCircle2 className="h-3 w-3 text-green-600" />;
  };

  const handleQuickToggle = () => {
    updateSettings({ enabled: !settings?.enabled });
  };

  const handleForceCheck = () => {
    // Trigger immediate check by resetting lastCheck
    updateSettings({ lastCheck: null });
    setNextCheckIn(5000); // Check in 5 seconds
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Zahlungsüberwachung
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()} className="text-xs">
              {settings?.enabled ? 'Aktiv' : 'Pausiert'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickToggle}
              className="h-6 w-6 p-0"
            >
              {settings?.enabled ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {settings?.enabled ? (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Nächste Prüfung in:</span>
              <span className="font-mono">
                {formatTimeRemaining(nextCheckIn)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Intervall:</span>
              <span>{(settings?.interval || 600000) / 60000} Min</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceCheck}
                className="flex-1 h-7 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Jetzt prüfen
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <AlertCircle className="h-3 w-3" />
              Automatische Prüfung pausiert
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickToggle}
              className="h-7 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Aktivieren
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Sucht nach SD-Bestellnummern in Bankdaten
        </div>
      </CardContent>
    </Card>
  );
}