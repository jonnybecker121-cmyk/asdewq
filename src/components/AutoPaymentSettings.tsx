import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Settings, 
  Timer, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Calculator
} from 'lucide-react';
import { useSettingsStore } from './store/settingsStore';
import { useOrderStore } from './store/orderStore';
import { statevApi } from './services/statevApi';

export function AutoPaymentSettings() {
  const { 
    autoPaymentSettings: settings, 
    setAutoPaymentSettings: updateSettings 
  } = useSettingsStore();
  const { checkForPaymentMatches } = useOrderStore();
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [lastManualCheck, setLastManualCheck] = useState<Date | null>(null);

  const intervalOptions = [
    { value: 300000, label: '5 Minuten' },
    { value: 600000, label: '10 Minuten' },
    { value: 900000, label: '15 Minuten' },
    { value: 1800000, label: '30 Minuten' },
    { value: 3600000, label: '1 Stunde' }
  ];

  const formatInterval = (ms: number) => {
    const minutes = ms / 60000;
    if (minutes >= 60) {
      return `${minutes / 60} Stunde${minutes / 60 > 1 ? 'n' : ''}`;
    }
    return `${minutes} Minute${minutes > 1 ? 'n' : ''}`;
  };

  const handleToggleAutoCheck = (enabled: boolean) => {
    updateSettings({ enabled });
    
    // Show toast notification
    if (typeof window !== 'undefined') {
      import('sonner').then(({ toast }) => {
        toast.success(
          enabled ? 'Automatischer Zahlungsabgleich aktiviert' : 'Automatischer Zahlungsabgleich deaktiviert',
          {
            description: enabled 
              ? `Prüfung alle ${formatInterval(settings?.interval || 600000)} nach SD-Bestellnummern`
              : 'Automatische Prüfung gestoppt'
          }
        );
      }).catch(() => {
        console.log('Toast notification not available');
      });
    }
  };

  const handleIntervalChange = (value: string) => {
    const interval = parseInt(value);
    updateSettings({ interval });
    
    if (typeof window !== 'undefined') {
      import('sonner').then(({ toast }) => {
        toast.info('Prüfintervall geändert', {
          description: `Neue Prüfung alle ${formatInterval(interval)}`
        });
      }).catch(() => {
        console.log('Toast notification not available');
      });
    }
  };

  const performManualCheck = async () => {
    setIsManualChecking(true);
    
    try {
      console.log('🔄 Manual payment check initiated...');
      
      // Get bank accounts
      const accounts = await statevApi.getFactoryBankAccounts();
      const filteredAccounts = accounts.filter(account => account?.vban?.toString() === '409856');
      
      if (filteredAccounts.length === 0) {
        if (typeof window !== 'undefined') {
          import('sonner').then(({ toast }) => {
            toast.error('Fehler', {
              description: 'Kein passendes Bankkonto gefunden'
            });
          });
        }
        return;
      }

      const bankId = filteredAccounts[0].id;
      
      // Get recent transactions (last 100)
      const transactionData = await statevApi.getTransactions(bankId, 100, 0);
      
      if (transactionData.transactions.length > 0) {
        // Filter for incoming transactions with SD pattern
        const incomingTransactions = transactionData.transactions.filter(t => {
          const isIncoming = t.receiverVban && t.receiverVban.toString() === '409856';
          const hasPurpose = t.purpose || t.reference;
          return isIncoming && hasPurpose;
        });
        
        const sdTransactions = incomingTransactions.filter(t => {
          const purpose = (t.purpose || t.reference || '').toString();
          return /SD\d{4,}/i.test(purpose);
        });
        
        console.log(`🔍 Checking ${transactionData.transactions.length} transactions...`);
        console.log(`💰 Found ${sdTransactions.length} with SD-Bestellnummern`);
        
        if (sdTransactions.length > 0) {
          checkForPaymentMatches(sdTransactions);
        } else {
          // Still check all incoming transactions for fallback matching
          checkForPaymentMatches(incomingTransactions);
        }
        
        setLastManualCheck(new Date());
        
        // Show success toast
        if (typeof window !== 'undefined') {
          import('sonner').then(({ toast }) => {
            toast.success('Manueller Zahlungsabgleich abgeschlossen', {
              description: `${transactionData.transactions.length} Transaktionen geprüft, ${sdTransactions.length} SD-Bestellnummern gefunden`
            });
          });
        }
      } else {
        if (typeof window !== 'undefined') {
          import('sonner').then(({ toast }) => {
            toast.info('Keine Transaktionen gefunden', {
              description: 'Keine neuen Transaktionen zum Überprüfen'
            });
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Manual payment check failed:', error);
      
      if (typeof window !== 'undefined') {
        import('sonner').then(({ toast }) => {
          toast.error('Fehler beim Zahlungsabgleich', {
            description: error instanceof Error ? error.message : 'Unbekannter Fehler'
          });
        });
      }
    } finally {
      setIsManualChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automatischer Zahlungsabgleich
          <Badge variant={settings?.enabled ? "default" : "secondary"} className="ml-auto">
            {settings?.enabled ? "Aktiv" : "Inaktiv"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {settings?.enabled ? (
                <Play className="h-4 w-4 text-green-600" />
              ) : (
                <Pause className="h-4 w-4 text-gray-400" />
              )}
              <Label className="font-medium">Automatische Prüfung</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Sucht automatisch nach SD-Bestellnummern in Bankdaten
            </p>
          </div>
          <Switch
            checked={settings?.enabled || false}
            onCheckedChange={handleToggleAutoCheck}
          />
        </div>

        {/* Interval Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <Label>Prüfintervall</Label>
          </div>
          
          <Select
            value={settings?.interval?.toString() || '600000'}
            onValueChange={handleIntervalChange}
            disabled={!settings?.enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {intervalOptions.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <p className="text-xs text-muted-foreground">
            Aktuell: Prüfung alle {formatInterval(settings?.interval || 600000)}
          </p>
        </div>

        {/* Manual Check */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <Label>Manuelle Prüfung</Label>
          </div>
          
          <Button 
            onClick={performManualCheck} 
            disabled={isManualChecking}
            variant="outline"
            className="w-full"
          >
            <Calculator className={`h-4 w-4 mr-2 ${isManualChecking ? 'animate-spin' : ''}`} />
            {isManualChecking ? 'Prüfe Zahlungen...' : 'Jetzt Zahlungen prüfen'}
          </Button>
          
          {lastManualCheck && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Letzte manuelle Prüfung: {lastManualCheck.toLocaleString('de-DE')}
            </div>
          )}
        </div>

        {/* Status Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Funktionsweise:</strong>
            <br />
            • Sucht nach "SD" gefolgt von mindestens 4 Ziffern im Verwendungszweck
            <br />
            • Setzt Aufträge automatisch auf "Gezahlt" bei Zahlungseingang
            <br />
            • Schließt Aufträge nach 1 Stunde automatisch ab
            <br />
            • Funktioniert nur mit eingehenden Zahlungen
          </AlertDescription>
        </Alert>

        {/* Current Status */}
        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Automatische Prüfung
            </TabsTrigger>
            <TabsTrigger value="completion" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Auto-Abschluss
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="monitoring" className="mt-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className={`h-5 w-5 ${settings?.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium">Automatische Prüfung</span>
                <Badge variant={settings?.enabled ? 'default' : 'secondary'} className="ml-auto">
                  {settings?.enabled ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {settings?.enabled 
                  ? `Das System prüft automatisch alle ${formatInterval(settings?.interval || 600000)} auf neue StateV.de Zahlungen und gleicht diese mit offenen Aufträgen ab.`
                  : 'Die automatische Überwachung ist derzeit deaktiviert. Zahlungen müssen manuell abgeglichen werden.'
                }
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium">Prüfintervall</div>
                  <div className="text-muted-foreground">{formatInterval(settings?.interval || 600000)}</div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium">Status</div>
                  <div className={settings?.enabled ? 'text-green-600' : 'text-gray-500'}>
                    {settings?.enabled ? 'Läuft' : 'Gestoppt'}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="completion" className="mt-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Auto-Abschluss</span>
                <Badge variant="outline" className="ml-auto">
                  Aktiv
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Aufträge mit Status "Gezahlt" werden automatisch nach 30 Minuten auf "Abgeschlossen" gesetzt und nach weiteren 24 Stunden ins Archiv verschoben.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium">Gezahlt → Abgeschlossen</div>
                  <div className="text-muted-foreground">30 Minuten</div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium">Abgeschlossen → Archiv</div>
                  <div className="text-muted-foreground">24 Stunden</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}