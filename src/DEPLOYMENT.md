# 🚀 DEPLOYMENT GUIDE

Schritt-für-Schritt Anleitung für das Deployment deines SCHMELZDEPOT Systems

## 📋 Voraussetzungen

- ✅ Supabase-Projekt erstellt
- ✅ Environment Variables gesetzt:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 🏗️ 1. Backend deployen (Supabase Edge Functions)

### Schritt 1: Supabase CLI installieren

```bash
npm install -g supabase
```

### Schritt 2: Login

```bash
supabase login
```

### Schritt 3: Edge Function deployen

```bash
supabase functions deploy make-server-9acd92e5
```

### Schritt 4: Secrets setzen

```bash
supabase secrets set SUPABASE_URL="https://xxx.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJxxx..."
```

## 🌐 2. Frontend deployen

### Option A: Vercel

1. Repository auf GitHub pushen
2. Vercel Account verbinden
3. Neues Projekt erstellen
4. Environment Variables setzen:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```
5. Deploy!

### Option B: Netlify

1. Repository auf GitHub pushen
2. Netlify Account verbinden
3. Neues Projekt erstellen
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment Variables setzen
6. Deploy!

### Option C: Eigener Server

```bash
# Build erstellen
npm run build

# Dist-Ordner auf Server hochladen
scp -r dist/* user@server:/var/www/schmelzdepot/

# Nginx konfigurieren (Beispiel)
server {
  listen 80;
  server_name schmelzdepot.de;
  root /var/www/schmelzdepot;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 🗄️ 3. Datenbank Setup

Die KV-Store-Tabelle wird automatisch erstellt. Falls nicht:

```sql
-- Bereits vorhanden in Supabase:
CREATE TABLE kv_store_9acd92e5 (
  key TEXT PRIMARY KEY,
  value JSONB
);
```

## ✅ 4. Deployment validieren

### Health Check

```bash
curl https://xxx.supabase.co/functions/v1/make-server-9acd92e5/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Erwartete Response:
```json
{
  "status": "ok",
  "database": "supabase-kv-store",
  "timestamp": "2025-10-18T..."
}
```

### LiveSync testen

```bash
# Daten abrufen
curl https://xxx.supabase.co/functions/v1/make-server-9acd92e5/live-sync/orderStore \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Daten speichern
curl -X POST https://xxx.supabase.co/functions/v1/make-server-9acd92e5/live-sync/orderStore \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":{"test":"data"},"timestamp":1697654400000}'
```

## 🔄 5. Post-Deployment Checklist

- [ ] Health-Check erfolgreich
- [ ] Frontend lädt korrekt
- [ ] Server Connection Status zeigt "Online"
- [ ] LiveSync funktioniert (Test mit 2 Tabs)
- [ ] Aufträge können erstellt werden
- [ ] Inventar synchronisiert
- [ ] Bank-Transaktionen speichern
- [ ] Backups werden erstellt
- [ ] Multi-User-Test durchgeführt

## 🔐 6. Sicherheit

### Production Settings

1. **CORS beschränken** (in `index.tsx`):
```typescript
cors({
  origin: "https://schmelzdepot.de", // Nur deine Domain
  // ...
})
```

2. **Rate Limiting** einrichten
3. **API-Keys rotieren** regelmäßig
4. **HTTPS erzwingen**

## 📊 7. Monitoring

### Supabase Dashboard
- Edge Function Logs ansehen
- Datenbank-Queries monitoren
- API-Requests tracken

### Frontend Monitoring
```typescript
// In Browser Console
apiClient.healthCheck()
apiClient.getSyncStatus()
```

## 🐛 8. Troubleshooting

### Edge Function startet nicht
```bash
# Logs ansehen
supabase functions logs make-server-9acd92e5

# Neustart
supabase functions deploy make-server-9acd92e5 --no-verify-jwt
```

### CORS-Fehler
- Prüfe CORS-Settings in `index.tsx`
- Stelle sicher, dass Frontend die richtige URL verwendet

### Daten synchronisieren nicht
- Prüfe Network-Tab in DevTools
- Validiere Bearer Token
- Checke Server-Logs

## 🔄 9. Updates deployen

### Backend updaten
```bash
# Änderungen in /supabase/functions/server/index.tsx
supabase functions deploy make-server-9acd92e5
```

### Frontend updaten
```bash
npm run build
# Upload zu Hosting-Provider
```

## 📈 10. Skalierung

### Performance optimieren

1. **CDN verwenden** für statische Assets
2. **Caching aktivieren** für API-Responses
3. **Connection Pooling** für Datenbank
4. **Edge Functions** regional deployen

### Kosten optimieren

- Monitoring von API-Calls
- Alte Backups regelmäßig löschen
- Polling-Intervalle anpassen bei Bedarf

---

## 🎉 Fertig!

Dein SCHMELZDEPOT Business-Management-System ist jetzt live!

### Support-Kontakte

- **Supabase Support**: https://supabase.com/support
- **Edge Functions Docs**: https://supabase.com/docs/guides/functions

### Nächste Schritte

1. 🎨 Custom Domain einrichten
2. 🔔 Notifications implementieren
3. 📧 Email-Versand für Rechnungen
4. 📱 PWA für mobile Nutzung
5. 🌍 Internationalisierung

---

**Happy Deploying! 🚀**
