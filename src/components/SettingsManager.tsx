import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Settings, Zap, CheckCircle, Clock, Hash, Bell, Cloud, CloudOff, Activity } from 'lucide-react';
import { AutoPaymentSettings } from './AutoPaymentSettings';
import { OrderNumberSettings } from './OrderNumberSettings';
import { TabVisibilityManager } from './TabVisibilityManager';
import { BackupManager } from './BackupManager';
import { DiscordSettings } from './DiscordSettings';
import { useSettingsStore } from './store/settingsStore';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { Lock, ShieldCheck, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';
import { ApiSettings } from './ApiSettings';

export default function SettingsManager() {
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

      {/* API Settings */}
      <ApiSettings />

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

      {/* Backup Manager */}
      <BackupManager />



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

      {/* System Status & Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Aktuelle Systemleistung und Integrationen
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
        </CardContent>
      </Card>
    </div>
  );
}