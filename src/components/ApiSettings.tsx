import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Globe, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { statevApi } from './services/statevApi';

export function ApiSettings() {
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedFactoryId, setDetectedFactoryId] = useState<string>('');

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('unknown');
    setErrorMessage('');
    setDetectedFactoryId('');
    
    try {
      // Test basic connectivity using the hardcoded credentials
      const factories = await statevApi.getFactoryList();
      
      if (factories && factories.length > 0) {
        setDetectedFactoryId(factories[0].id);
        
        // Test inventory access to confirm permissions (uses auto-resolution internally)
        await statevApi.getFactoryInventory(factories[0].id);
        
        setConnectionStatus('success');
        toast.success('System integriert', {
          description: `Verbunden mit Factory: ${factories[0].name}`
        });
      } else {
        throw new Error('Keine Factories gefunden. Bitte prüfen Sie die Berechtigungen des Keys.');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler');
      toast.error('Verbindungstest fehlgeschlagen', {
        description: error instanceof Error ? error.message : 'Prüfen Sie die System-Konfiguration.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="bg-card border border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="border-b border-primary/20 bg-card">
        <CardTitle className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/90 rounded-md shadow-md shadow-primary/10">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-black dark:text-white">StateV System-Status</span>
        </CardTitle>
        <CardDescription>
          Status der fest integrierten API-Verbindung
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        
        <Alert className="bg-primary/5 border-primary/20">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertTitle>System Integriert</AlertTitle>
          <AlertDescription>
            API Key und Secret sind fest im System hinterlegt. Keine manuelle Konfiguration notwendig.
          </AlertDescription>
        </Alert>

        {connectionStatus === 'error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Verbindungsfehler</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === 'success' && (
          <Alert className="border-green-500 text-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Verbunden</AlertTitle>
            <AlertDescription>
              Verbindung aktiv. <br/>
              <span className="text-xs opacity-80">Factory ID: {detectedFactoryId}</span>
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={testConnection} className="w-full" disabled={isTesting}>
          {isTesting ? 'Prüfe System...' : 'Verbindungsstatus prüfen'}
        </Button>
      </CardContent>
    </Card>
  );
}