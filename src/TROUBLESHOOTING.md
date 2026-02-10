# 🔧 TROUBLESHOOTING GUIDE

Diese Anleitung hilft bei der Behebung häufiger Probleme.

## 🔴 SERVER CONNECTION FEHLER

### Symptom
```
❌ [API] Request failed for /health: TypeError: Failed to fetch
❌ [Server] Connection failed: TypeError: Failed to fetch
❌ [LiveSync] Push/Pull failed: TypeError: Failed to fetch
```

### Lösung 1: Datenbank-Tabelle erstellen

Die App benötigt eine KV-Store Tabelle in Supabase:

1. **Öffne Supabase SQL Editor**
2. **Führe Setup-Script aus**: Siehe [SETUP_DATABASE.md](./SETUP_DATABASE.md)
3. **Refresh die App**

### Lösung 2: Edge Function deployen

Falls die Tabelle existiert, aber Server trotzdem offline:

```bash
# Edge Function deployen
supabase functions deploy make-server-9acd92e5

# Secrets setzen
supabase secrets set SUPABASE_URL="https://xxx.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJxxx..."
```

### Lösung 3: Offline-Modus nutzen

Die App funktioniert auch **ohne Server**:
- ✅ Alle Daten werden in localStorage gespeichert
- ✅ LiveSync wird automatisch deaktiviert
- ✅ Status-Badge zeigt "Server Offline"
- ✅ Keine Fehlermeldungen - graceful degradation

---

## 🗄️ DATENBANK-FEHLER

### Symptom
```
❌ Could not find the table 'public.kv_store_9acd92e5' in the schema cache
```

### Lösung
Die Tabelle fehlt - folge dem [SETUP_DATABASE.md](./SETUP_DATABASE.md) Guide.

**Quick Fix:**
```sql
-- In Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.kv_store_9acd92e5 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📦 localStorage Quota Exceeded

### Symptom
```
QuotaExceededError: Failed to store data in localStorage
```

### Lösung
Das sollte nicht mehr auftreten, da Backups jetzt auf dem Server liegen. Falls doch:

1. **Alte Backups löschen**:
   ```javascript
   // In Browser Console
   Object.keys(localStorage)
     .filter(key => key.includes('backup'))
     .forEach(key => localStorage.removeItem(key));
   ```

2. **Browser-Daten löschen**:
   - Chrome: Einstellungen → Datenschutz → Browserdaten löschen
   - Nur "Cookies und Websitedaten" auswählen

---

## 🔄 LiveSync funktioniert nicht

### Symptom
- Änderungen werden nicht synchronisiert
- Multi-User-Updates fehlen

### Diagnostik
1. Öffne **Einstellungen → LiveSync Debug Panel**
2. Prüfe Connection Status
3. Checke Timestamps

### Lösung
```javascript
// Manuelles Sync erzwingen
// In Browser Console:
window.location.reload(); // Lädt alle Daten vom Server

// Oder: Sync-Button im Header klicken
```

### Wichtig: On-Demand Sync!
```
Änderungen werden SOFORT gespeichert (PUSH)
Updates werden NUR geladen bei:
  1. Tab-Wechsel
  2. Klick auf "Neu laden" Button
  
Dies ist KEIN Fehler - es ist by design!
```

---

## ⚠️ Cloudflare 521 Error

### Symptom
```html
<title>Web server is down | 521</title>
```

### Ursache
Supabase Edge Function ist offline oder neu deployed.

### Lösung
1. **Warte 2-3 Minuten** (Cold Start)
2. **Prüfe Supabase Status**: https://status.supabase.com
3. **Check Edge Function Logs** im Dashboard
4. **Neustart erzwingen**:
   ```bash
   supabase functions deploy make-server-9acd92e5 --no-verify-jwt
   ```

**WICHTIG**: Die App funktioniert auch ohne Server! Alle Features bleiben verfügbar, nur Multi-User-Sync ist deaktiviert.

---

## 🧪 API Test Tool verwenden

Für Debugging: **Einstellungen → Development-Modus aktivieren**

Dann erscheint "API Endpunkt Tests" Karte:
- ✅ Teste alle Endpunkte einzeln
- ✅ Sieh Responses in Echtzeit
- ✅ Prüfe Fehler pro Endpoint

---

## 💾 Backup wiederherstellen

Falls Daten verloren gehen:

1. **Einstellungen → Backup Manager öffnen**
2. **Letztes Backup wählen**
3. **"Wiederherstellen" klicken**
4. App wird neugeladen

---

## 🔑 Environment Variables fehlen

### Symptom
```
projectId is not defined
publicAnonKey is not defined
```

### Lösung
Erstelle `/utils/supabase/info.tsx`:

```typescript
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

---

## 📊 Connection Monitoring

### Server Status prüfen
Im Header rechts oben:
- 🟢 **Server Online** = Alles OK
- 🔴 **Server Offline** = Funktioniert trotzdem (localStorage)
- 🔄 **Verbinde...** = Checking connection

### Manuell testen
```javascript
// Browser Console:
await apiClient.healthCheck();
// Sollte { status: "ok" } zurückgeben
```

---

## 🐛 Weitere Probleme?

1. **Browser Console öffnen** (F12)
2. **Fehler kopieren**
3. **Dev-Mode aktivieren** (Einstellungen)
4. **Logs prüfen**

### Debugging-Tools
```javascript
// In Browser Console:
window.backupSystem         // Backup-Funktionen
apiClient.healthCheck()     // Server-Test
apiClient.getSyncStatus()   // Sync-Status
```

### LiveSync Debug Panel
**Einstellungen → Live-Sync Status**
- Zeigt alle synchronisierten Stores
- Timestamps und Status
- Letzte Synchronisierung

---

## 🚀 Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Server Offline | App funktioniert trotzdem! ✅ |
| Keine Updates | Klick auf "Neu laden" Button |
| Alte Daten | Tab wechseln |
| API Errors | Warte 30 Sek (Auto-Fallback) |
| Zu viele Errors in Console | Normal bei Offline - wird ignoriert |

---

## 🔬 Advanced Debugging

### Supabase Database direkt prüfen
```sql
-- In Supabase SQL Editor:
SELECT * FROM kv_store_9acd92e5 WHERE key LIKE 'live-sync:%';
```

### Network Tab analysieren
```
1. F12 → Network Tab
2. Filter: "live-sync"
3. Prüfen:
   - Status Codes (200 = OK)
   - Response Time (<500ms ideal)
   - Request Count (minimal bei On-Demand)
```

### Backend Logs ansehen
```
Supabase Dashboard → Functions → Logs
Suchen nach:
- [LiveSync GET] 
- [LiveSync POST]
- Error messages
```

---

## ✅ System-Check

### Checkliste für erfolgreiche Installation

- [ ] Health Endpoint antwortet: `/health`
- [ ] Live-Sync Status abrufbar: `/live-sync-status`
- [ ] Database-Tabelle existiert: `kv_store_9acd92e5`
- [ ] Server Connection Status zeigt "Online"
- [ ] Console zeigt keine kritischen Errors
- [ ] Änderungen werden gespeichert
- [ ] Multi-Tab-Test erfolgreich

### Multi-Tab Test

```
1. Tab 1 öffnen → Auftrag erstellen
   → Auftrag wird SOFORT in DB gespeichert ✅
   
2. Tab 2 öffnen (gleicher Browser)
   → Beim Laden erscheint Auftrag ✅
   
3. Tab 2 → Auftrag bearbeiten
   → Änderung SOFORT in DB gespeichert ✅
   
4. Tab 1 → Klick auf "Neu laden" Button
   → Änderung erscheint in Tab 1 ✅

✅ Funktioniert = System OK!
❌ Funktioniert nicht = Server offline (App funktioniert trotzdem)
```

---

## 📚 Weitere Dokumentation

- 📖 [SERVER_HOSTING_GUIDE.md](./SERVER_HOSTING_GUIDE.md) - Server-Dokumentation
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment-Anleitung
- 🗄️ [SETUP_DATABASE.md](./SETUP_DATABASE.md) - Database-Setup
- 📘 [README.md](./README.md) - Haupt-Dokumentation

---

**Status:** ✅ System funktioniert auch offline!  
**Fehler-Toleranz:** Hoch - Graceful Degradation  
**Letzte Aktualisierung:** 2025-10-19
