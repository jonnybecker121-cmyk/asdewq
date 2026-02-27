import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Settings, Zap, Bug, TestTube, Timer, CheckCircle, Clock, Hash, Trash2, AlertTriangle, Code2, Activity, Bell, Cloud, CloudOff } from 'lucide-react';
import { AutoPaymentSettings } from './AutoPaymentSettings';
import { AutoPaymentDebugger } from './AutoPaymentDebugger';
import { PaymentTestHelper } from './PaymentTestHelper';
import { TestModeToggle } from './TestModeToggle';
import { OrderNumberSettings } from './OrderNumberSettings';
import { TabVisibilityManager } from './TabVisibilityManager';
import { PerformanceDashboard } from './PerformanceDashboard';
import { BackupManager } from './BackupManager';
import { DiscordSettings } from './DiscordSettings';
import { useDevMode } from './DevModeToggle';
import { useSettingsStore } from './store/settingsStore';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Lock, ShieldCheck, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';

export default function SettingsManager() {
  const isDevMode = useDevMode();
  const [devMode, setDevMode] = useState(isDevMode);
  const { syncEnabled, setSyncEnabled, workspaceId, setWorkspaceId, bankPin, setBankPin } = useSettingsStore();
  
  // State for PIN change verification
  const [pinStep, setPinStep] = useState<'verify' | 'new'>(bankPin ? 'verify' : 'new');
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  const handleVerifyOldPin = () => {
    if (oldPinInput === bankPin) {
      setPinStep('new');
      setOldPinInput('');
      toast.success('Alter PIN bestätigt');
    } else {
      toast.error('Falscher PIN', { description: 'Der eingegebene alte PIN ist nicht korrekt.' });
      setOldPinInput('');
    }
  };

  const handleSetNewPin = () => {
    const val = newPinInput.replace(/\D/g, '').slice(0, 4);
    setBankPin(val);
    setNewPinInput('');
    if (val) {
      setPinStep('verify'); // Back to verify mode for next time
      toast.success('Neuer PIN gesetzt');
    } else {
      setPinStep('new'); // Stay here if they just cleared it
      toast.info('PIN entfernt');
    }
  };

  const handleDevModeToggle = (checked: boolean) => {
    setDevMode(checked);
    localStorage.setItem('schmelzdepot-dev-mode', JSON.stringify(checked));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    toast.success(
      checked ? '⚡ Development-Modus aktiviert' : '✅ Produktiv-Modus aktiviert',
      {
        description: checked 
          ? 'Erweiterte Funktionen sind jetzt verfügbar'
          : 'System läuft im Produktiv-Modus',
      }
    );
  };

  const handleSyncToggle = (checked: boolean) => {
    setSyncEnabled(checked);
    toast.success(
      checked ? '☁️ Synchronisation aktiviert' : '📴 Lokaler Modus aktiviert',
      {
        description: checked 
          ? 'Daten werden jetzt mit dem Server abgeglichen'
          : 'Daten werden nur noch im Sitzungsspeicher vorgehalten',
      }
    );
  };
  
  const forceSync = () => {
    window.dispatchEvent(new Event('focus')); // Trigger focus event which LiveSyncManager listens to
    toast.success('🔄 Synchronisation angestoßen', { description: 'Daten werden vom Server abgerufen...' });
  };
  
  // Navigation tabs für Tab-Verwaltung
  const navigationTabs = [
    { id: 'dashboard', title: 'Dashboard', description: 'Übersicht & Statistiken' },
    { id: 'orders', title: 'Aufträge', description: 'Auftragsverwaltung' },
    { id: 'invoices', title: 'Rechnungen', description: 'Rechnungserstellung' },
    { id: 'contracts', title: 'Verträge', description: 'Vertragsverwaltung' },
    { id: 'inventory', title: 'Lager', description: 'Bestandsverwaltung' },
    { id: 'transport', title: 'Fahrbefehle', description: 'Transport & Logistik' },
    { id: 'employees', title: 'Mitarbeiter', description: 'Personalverwaltung' },
    { id: 'calculator', title: 'Preiskalkulator', description: 'EK zu VK berechnen' },
    { id: 'bank', title: 'Bank', description: 'Finanzmanagement' },
    { id: 'archive', title: 'Archiv', description: 'Archivverwaltung' },
    { id: 'settings', title: 'Einstellungen', description: 'System-Konfiguration' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
              <Settings className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-black dark:text-white">Einstellungen</span>
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie das automatische Zahlungssystem und weitere Einstellungen
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cloud Sync Settings */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
                {syncEnabled ? <Cloud className="h-4 w-4 text-primary-foreground" /> : <CloudOff className="h-4 w-4 text-primary-foreground" />}
              </div>
              <span className="text-black dark:text-white">Multi-User Synchronisation</span>
            </div>
            {syncEnabled && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={forceSync}
                className="h-8 gap-2 border-primary/30 hover:bg-primary/10"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync Jetzt
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie den Cloud-Abgleich Ihrer Daten zwischen verschiedenen Geräten
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-0.5">
              <Label htmlFor="sync-mode" className="text-base">
                Cloud Sync (Echtzeit)
              </Label>
              <p className="text-sm text-muted-foreground">
                {syncEnabled 
                  ? '☁️ Daten werden automatisch synchronisiert' 
                  : '📴 Reiner Offline-Modus (Kein Sync)'}
              </p>
            </div>
            <Switch
              id="sync-mode"
              checked={syncEnabled}
              onCheckedChange={handleSyncToggle}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-id" className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                Team-Arbeitsbereich ID
              </Label>
              <div className="flex gap-2">
                <Input
                  id="workspace-id"
                  placeholder="z.B. mein-team-name"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Teilen Sie diese ID mit Ihrem Team, um die gleichen Daten zu sehen. Verwenden Sie eine sichere, eindeutige Kennung.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Security Settings */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
              <Lock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-black dark:text-white">Bank Sicherheit</span>
          </CardTitle>
          <CardDescription>
            Sichern Sie den Zugriff auf Ihre Finanzdaten mit einem PIN
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Bank PIN Verwaltung
              </Label>
              
              {bankPin && pinStep === 'verify' ? (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium">Geben Sie Ihren aktuellen PIN ein, um ihn zu ändern:</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Alter PIN"
                        value={oldPinInput}
                        onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="pl-10 font-mono tracking-widest"
                        maxLength={4}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyOldPin()}
                      />
                    </div>
                    <Button onClick={handleVerifyOldPin} variant="outline">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium">
                    {bankPin ? 'Geben Sie den neuen 4-stelligen PIN ein:' : 'Legen Sie einen neuen 4-stelligen PIN fest:'}
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Neuer PIN (leer = kein Schutz)"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="pl-10 font-mono tracking-widest"
                        maxLength={4}
                        onKeyDown={(e) => e.key === 'Enter' && handleSetNewPin()}
                      />
                    </div>
                    <Button onClick={handleSetNewPin} className="bg-primary hover:bg-primary/90">
                      Speichern
                    </Button>
                    {bankPin && (
                      <Button onClick={() => setPinStep('verify')} variant="ghost">
                        Abbrechen
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                Dieser PIN schützt den "Bank"-Tab vor unbefugtem Zugriff auf demselben Gerät.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Mode Toggle */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
              <Code2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-black dark:text-white">Development-Modus</span>
          </CardTitle>
          <CardDescription>
            Aktivieren Sie erweiterte Entwickler-Funktionen und Debug-Tools
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dev-mode" className="text-base">
                Development-Modus
              </Label>
              <p className="text-sm text-muted-foreground">
                {devMode 
                  ? '⚡ Erweiterte Funktionen aktiv' 
                  : '✓ System läuft im Produktiv-Modus'}
              </p>
            </div>
            <Switch
              id="dev-mode"
              checked={devMode}
              onCheckedChange={handleDevModeToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Backup Manager */}
      <BackupManager />

      {/* Discord Notifications */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
              <Bell className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-black dark:text-white">Discord Integration</span>
          </CardTitle>
          <CardDescription>
            Automatische Discord-Benachrichtigungen für Bewegungs-Log Änderungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiscordSettings />
        </CardContent>
      </Card>

      {/* Tab Visibility Manager */}
      <TabVisibilityManager tabs={navigationTabs} />

      {/* Order Number Settings */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
              <Hash className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-black dark:text-white">Bestellnummern-Konfiguration</span>
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie das Format und die Startnummer für Auftragsbezeichnungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderNumberSettings />
        </CardContent>
      </Card>

      {/* Auto Payment Settings Section */}
      <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="border-b border-primary/20 bg-card">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-black dark:text-white">Automatische Zahlungsverarbeitung</span>
          </CardTitle>
          <CardDescription>
            Einstellungen für die automatische Erkennung und Verarbeitung von StateV.de Zahlungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutoPaymentSettings />
        </CardContent>
      </Card>

      {/* Test Mode Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Modus
          </CardTitle>
          <CardDescription>
            Aktivieren Sie den Test-Modus für verkürzte Timer und Debug-Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestModeToggle />
        </CardContent>
      </Card>

      {/* Payment Test Helper */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Zahlungstest-Hilfsprogramm
          </CardTitle>
          <CardDescription>
            Simulieren Sie Zahlungen und testen Sie die automatische Verarbeitung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentTestHelper />
        </CardContent>
      </Card>

      {/* System Status & Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status & Performance
          </CardTitle>
          <CardDescription>
            Aktuelle Systemleistung, Integrationen und Performance-Metriken
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">StateV API</h4>
                <p className="text-sm text-muted-foreground">Verbunden</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Datenspeicherung</h4>
                <p className="text-sm text-muted-foreground">Funktional</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Auto-Backup</h4>
                <p className="text-sm text-muted-foreground">Täglich aktiv</p>
              </div>
            </div>
          </div>
          
          {/* Performance Dashboard eingebettet */}
          {devMode && (
            <div className="pt-4 border-t">
              <PerformanceDashboard />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Payment Debugger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug-Tools
          </CardTitle>
          <CardDescription>
            Erweiterte Debug-Informationen und Protokoll-Anzeige für die Fehlerbehebung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutoPaymentDebugger />
        </CardContent>
      </Card>
    </div>
  );
}