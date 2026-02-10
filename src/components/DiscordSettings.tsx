import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Bell, BellOff, Send, Check, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useSettingsStore } from './store/settingsStore';
import { discordNotifier } from './services/discordNotifier';

export function DiscordSettings() {
  const { discordSettings, setDiscordSettings } = useSettingsStore();
  const [webhookUrl, setWebhookUrl] = useState(discordSettings.webhookUrl);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    setDiscordSettings({ webhookUrl });
    toast.success('Discord Webhook gespeichert');
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Bitte Webhook URL eingeben');
      return;
    }

    setTesting(true);
    try {
      const success = await discordNotifier.sendTestNotification(webhookUrl);
      if (success) {
        toast.success('Test-Benachrichtigung gesendet!', {
          description: 'Prüfe deinen Discord-Channel'
        });
      } else {
        toast.error('Test fehlgeschlagen', {
          description: 'Prüfe die Webhook URL'
        });
      }
    } catch (error) {
      toast.error('Fehler beim Senden', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    } finally {
      setTesting(false);
    }
  };

  const toggleEnabled = () => {
    if (!discordSettings.enabled && !webhookUrl) {
      toast.error('Bitte zuerst Webhook URL eingeben');
      return;
    }
    setDiscordSettings({ enabled: !discordSettings.enabled });
    toast.success(
      discordSettings.enabled 
        ? 'Discord Benachrichtigungen deaktiviert' 
        : 'Discord Benachrichtigungen aktiviert'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {discordSettings.enabled ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                Discord Benachrichtigungen
              </CardTitle>
              <CardDescription className="mt-2">
                Automatische Benachrichtigungen bei Bewegungs-Log Änderungen
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={discordSettings.enabled ? 'default' : 'secondary'}>
                {discordSettings.enabled ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Setup Guide */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Discord Webhook einrichten:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Öffne deinen Discord Server</li>
            <li>Server-Einstellungen → Integrationen → Webhooks</li>
            <li>Klicke auf "Neuer Webhook"</li>
            <li>Wähle den Channel für Benachrichtigungen</li>
            <li>Kopiere die Webhook URL und füge sie unten ein</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Webhook Configuration */}
      <Card className="bg-card border border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Webhook URL</CardTitle>
          <CardDescription>
            Discord Webhook URL für Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="password"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} variant="default" className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Speichern
            </Button>
            <Button 
              onClick={handleTestWebhook} 
              variant="outline" 
              className="flex-1"
              disabled={testing || !webhookUrl}
            >
              <Send className="h-4 w-4 mr-2" />
              {testing ? 'Sende...' : 'Test senden'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enable/Disable */}
      <Card className="bg-card border border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Aktivierung</CardTitle>
          <CardDescription>
            Benachrichtigungen ein- oder ausschalten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Discord Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">
                Sendet automatisch Benachrichtigungen bei Inventory-Änderungen
              </p>
            </div>
            <Switch
              checked={discordSettings.enabled}
              onCheckedChange={toggleEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-card border border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Benachrichtigungs-Typen</CardTitle>
          <CardDescription>
            Wähle welche Ereignisse benachrichtigt werden sollen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>✏️ Manuelle Änderungen</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung bei manuellen Inventory-Änderungen
              </p>
            </div>
            <Switch
              checked={discordSettings.notifyOnManual}
              onCheckedChange={(checked) => 
                setDiscordSettings({ notifyOnManual: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>🔄 API-Prüfungen</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung bei automatischen API-Checks
              </p>
            </div>
            <Switch
              checked={discordSettings.notifyOnApiCheck}
              onCheckedChange={(checked) => 
                setDiscordSettings({ notifyOnApiCheck: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>🚨 Bewegung erkannt</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung bei erkannten unerwarteten Bewegungen
              </p>
            </div>
            <Switch
              checked={discordSettings.notifyOnMovementDetected}
              onCheckedChange={(checked) => 
                setDiscordSettings({ notifyOnMovementDetected: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Threshold Settings */}
      <Card className="bg-card border border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Schwellenwert</CardTitle>
          <CardDescription>
            Minimale Änderung für Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">
              Minimale Änderung (Menge)
            </Label>
            <div className="flex gap-2">
              <Input
                id="threshold"
                type="number"
                min="0"
                value={discordSettings.minChangeThreshold}
                onChange={(e) => 
                  setDiscordSettings({ 
                    minChangeThreshold: parseInt(e.target.value) || 0 
                  })
                }
                className="flex-1"
              />
              <Button 
                variant="outline"
                onClick={() => setDiscordSettings({ minChangeThreshold: 1 })}
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nur Änderungen &gt;= {discordSettings.minChangeThreshold} werden benachrichtigt
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {discordSettings.enabled && (
        <Alert className="border-primary/20">
          <Check className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>Discord Integration aktiv!</strong>
            <div className="mt-2 space-y-1 text-sm">
              <div>✅ Webhook konfiguriert</div>
              <div>
                📢 Benachrichtigungen: 
                {discordSettings.notifyOnManual && ' Manuell'}
                {discordSettings.notifyOnApiCheck && ' • API-Check'}
                {discordSettings.notifyOnMovementDetected && ' • Bewegung'}
              </div>
              <div>🎯 Schwellenwert: {discordSettings.minChangeThreshold}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default DiscordSettings;
