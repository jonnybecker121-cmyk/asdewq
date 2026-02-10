import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Save, 
  RotateCcw, 
  Calendar,
  Download,
  Upload,
  Trash2,
  Info,
  HardDrive,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupSnapshot {
  timestamp: number;
  date: string;
  type: 'daily' | 'manual';
  data: any;
}

const BACKUP_STORAGE_KEY = 'schmelzdepot-local-backups';

export function BackupManager() {
  const [localBackups, setLocalBackups] = useState<BackupSnapshot[]>([]);

  const loadBackups = () => {
    try {
      const existingStr = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (existingStr) {
        const backups = JSON.parse(existingStr);
        setLocalBackups(backups.sort((a: any, b: any) => b.timestamp - a.timestamp));
      } else {
        setLocalBackups([]);
      }
    } catch (e) {
      console.error("Failed to load local backups", e);
    }
  };

  useEffect(() => {
    loadBackups();
    const interval = setInterval(loadBackups, 5000);
    return () => clearInterval(interval);
  }, []);

  const createBackup = () => {
    if ((window as any).backupSystem?.createBackup) {
      (window as any).backupSystem.createBackup('manual');
      setTimeout(loadBackups, 500);
    } else {
      toast.error("Backup-System nicht verfügbar");
    }
  };

  const downloadBackup = (backup: BackupSnapshot) => {
     const json = JSON.stringify(backup, null, 2);
     const blob = new Blob([json], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `schmelzdepot-backup-${new Date(backup.timestamp).toISOString().slice(0, 10)}.json`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
     toast.success('Backup heruntergeladen');
  };

  const restoreBackup = (backup: BackupSnapshot) => {
    if (confirm(`Möchten Sie das Backup vom ${new Date(backup.timestamp).toLocaleString()} wiederherstellen? Aktuelle Daten gehen verloren.`)) {
      if ((window as any).backupSystem?.restoreBackup) {
        const json = JSON.stringify(backup);
        (window as any).backupSystem.restoreBackup(json);
      }
    }
  };

  const clearBackups = () => {
    if (confirm("Alle lokalen Backups löschen?")) {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
      loadBackups();
      toast.success("Backups gelöscht");
    }
  };

  const importBackupFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if ((window as any).backupSystem?.restoreBackup) {
           (window as any).backupSystem.restoreBackup(event.target?.result as string);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const calculateSize = (backup: BackupSnapshot) => {
    const size = new Blob([JSON.stringify(backup)]).size;
    return (size / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="space-y-6">
       <Card className="bg-card border border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                Lokale Backups
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Gespeichert im Browser (Local Storage)
              </CardDescription>
            </div>
            <Button onClick={loadBackups} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Das System erstellt automatisch Snapshots im Browser. Sie können diese herunterladen und sicher aufbewahren.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Button onClick={createBackup} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Neues Backup erstellen
        </Button>
        <Button onClick={importBackupFile} variant="outline" className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          Backup importieren (Datei)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Verlauf ({localBackups.length})</CardTitle>
            {localBackups.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearBackups} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Verlauf löschen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {localBackups.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Keine Backups vorhanden.</p>
            ) : (
              localBackups.map((backup, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{new Date(backup.timestamp).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {backup.type === 'daily' ? 'Automatisch' : 'Manuell'} • {calculateSize(backup)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadBackup(backup)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => restoreBackup(backup)}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
