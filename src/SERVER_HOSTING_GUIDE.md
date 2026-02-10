# 🌐 Server Hosting Guide

Dein SCHMELZDEPOT Business-Management-System ist jetzt vollständig auf Server-Hosting umgestellt!

## 🎯 Was ist neu?

Das System läuft jetzt vollständig über ein **Supabase Backend** mit:

- ✅ **Zentrale Datenspeicherung** - Alle Daten auf dem Server (KV-Store)
- ✅ **Multi-User Support** - LiveSync-System für mehrere Benutzer gleichzeitig
- ✅ **REST API** - Vollständige API für alle Entitäten
- ✅ **Echtzeit-Synchronisierung** - Automatisches Sync über Server
- ✅ **Server-basierte Backups** - Keine localStorage-Quota-Probleme mehr
- ✅ **Connection Monitoring** - Live-Status-Anzeige der Server-Verbindung

## 🏗️ Architektur

```
┌─────────────────┐
│   Frontend      │ ← React + Zustand
│   (Browser)     │
└────────┬────────┘
         │ REST API
         │ (apiClient.ts)
         ▼
┌─────────────────┐
│  Supabase Edge  │ ← Hono Server
│   Functions     │ ← /make-server-9acd92e5/*
└────────┬────────┘
         │ KV Store
         ▼
┌─────────────────┐
│   Supabase KV   │ ← Postgres Table
│   Database      │ ← kv_store_9acd92e5
└─────────────────┘
```

## 📡 API-Endpunkte

### Live-Sync
- `GET /live-sync/:storeName` - Lade Sync-Daten
- `POST /live-sync/:storeName` - Speichere Sync-Daten
- `GET /live-sync-status` - Status aller Stores

### Aufträge (Orders)
- `GET /orders` - Alle Aufträge
- `GET /orders/:id` - Einzelner Auftrag
- `POST /orders` - Auftrag speichern
- `POST /orders/bulk` - Bulk-Speicherung
- `DELETE /orders/:id` - Auftrag löschen

### Kunden (Customers)
- `GET /customers` - Alle Kunden
- `POST /customers` - Kunde speichern
- `DELETE /customers/:id` - Kunde löschen

### Artikel (Items)
- `GET /items` - Alle Artikel
- `POST /items` - Artikel speichern
- `DELETE /items/:id` - Artikel löschen

### Inventar (Inventory)
- `GET /inventory` - Alle Inventar-Items
- `GET /inventory/:id` - Einzelnes Item
- `POST /inventory` - Item speichern
- `POST /inventory/bulk` - Bulk-Speicherung
- `DELETE /inventory/:id` - Item löschen
- `GET /inventory/snapshot/base` - Basis-Snapshot
- `POST /inventory/snapshot/base` - Snapshot speichern

### Rechnungen (Invoices)
- `GET /invoices` - Alle Rechnungen
- `POST /invoices` - Rechnung speichern

### Bank
- `GET /bank/accounts` - Alle Konten
- `POST /bank/accounts` - Konto speichern
- `GET /bank/transactions/:accountId` - Transaktionen
- `POST /bank/transactions` - Transaktion speichern

### Mitarbeiter (Employees)
- `GET /employees` - Alle Mitarbeiter
- `POST /employees` - Mitarbeiter speichern
- `DELETE /employees/:id` - Mitarbeiter löschen

### Rechner (Calculator)
- `GET /calculator` - Alle Einträge
- `POST /calculator` - Eintrag speichern
- `DELETE /calculator/:id` - Eintrag löschen

### Einstellungen (Settings)
- `GET /settings` - Alle Einstellungen
- `POST /settings` - Einstellung speichern

### Backups
- `POST /backups/tab` - Tab-Backup (alle 10 Min)
- `POST /backups/full` - Voll-Backup (Mitternacht)
- `DELETE /backups/cleanup` - Alte Backups löschen
- `GET /backups` - Alle Backups auflisten

### System
- `GET /health` - Health-Check

## 🔧 Verwendung

### API-Client verwenden

```typescript
import { apiClient } from './components/services/apiClient';

// Aufträge laden
const response = await apiClient.getOrders();
console.log(response.orders);

// Auftrag speichern
await apiClient.saveOrder(orderData);

// LiveSync
const syncData = await apiClient.syncGet('orderStore');
await apiClient.syncPost('orderStore', data, timestamp);
```

### Connection Status

Der Server-Status wird in der oberen rechten Ecke angezeigt:

- 🟢 **Grün** = Server Online
- 🔴 **Rot** = Server Offline
- 🔄 **Grau** = Verbinde...

## 🔄 LiveSync-System

Das LiveSync-System synchronisiert automatisch alle Stores:

1. **Local Store** ändert sich → POST zu Server
2. **Polling** (alle 5 Sek) → GET vom Server
3. **Timestamp-basiert** → Last-Write-Wins
4. **Multi-User** → Änderungen anderer User werden automatisch übernommen

### Unterstützte Stores:
- `orderStore` - Aufträge
- `inventoryStore` - Inventar
- `bankStore` - Bank-Konten & Transaktionen
- `calculatorStore` - Preisrechner
- `employeeStore` - Mitarbeiter
- `invoiceStore` - Rechnungen
- `settingsStore` - Einstellungen

## 🛡️ Error-Handling

Alle API-Calls enthalten automatisches Error-Handling:

```typescript
try {
  const response = await apiClient.getOrders();
  if (response.success) {
    // Erfolgreich
  }
} catch (error) {
  // Fehler wird automatisch geloggt
  console.error('API Error:', error);
}
```

## 🗄️ Datenmigration

Beim ersten Start nach dem Update:

1. ✅ Alte localStorage-Backups werden automatisch gelöscht
2. ✅ Daten bleiben in den Stores (werden beim nächsten Sync hochgeladen)
3. ✅ LiveSync übernimmt automatisch Synchronisierung

## 🔐 Sicherheit

- **Bearer Token Authentication** - Alle Requests mit Token
- **CORS aktiviert** - Sichere Cross-Origin-Requests
- **Private Buckets** - Supabase Storage mit signed URLs
- **Service Role Key** - Nur Server hat vollen Zugriff

## 📊 Monitoring

### Server Health Check
```typescript
const health = await apiClient.healthCheck();
console.log(health.status); // "ok"
```

### Sync Status
```typescript
const status = await apiClient.getSyncStatus();
console.log(status.stores); // Array aller Stores mit Timestamps
```

## 🚀 Performance

- **Polling-Intervall**: 5 Sekunden
- **Health-Check**: 30 Sekunden
- **Backup-Intervall**: 10 Minuten (Tab), Mitternacht (Full)
- **Cleanup**: Alte Backups werden um Mitternacht gelöscht

## 🎨 UI-Komponenten

### Server Connection Status
Zeigt Live-Status der Server-Verbindung im Header an.

### LiveSync Indicator
Badge zeigt an, ob LiveSync aktiv ist (bereits vorhanden).

## ⚡ Next Steps

1. **Teste Multi-User**: Öffne in mehreren Browser-Tabs
2. **Prüfe Sync**: Ändere Daten in einem Tab, siehe Update in anderem
3. **Monitor Logs**: Öffne Console für detaillierte Logs
4. **Backups prüfen**: Warte 10 Min, prüfe Server-Logs

## 🐛 Troubleshooting

### Server Offline?
- Prüfe Supabase-Projekt-Status
- Prüfe Edge Function Logs im Dashboard
- Health-Check manuell testen

### Sync funktioniert nicht?
- Console-Logs prüfen
- Timestamp-Konflikte checken
- Store-Namen validieren

### API-Fehler?
- Network-Tab in DevTools öffnen
- Request/Response inspizieren
- Server-Logs im Supabase Dashboard

---

**Status**: ✅ Vollständig Server-Ready!  
**Version**: 2.0 (Server-Hosting)  
**Letztes Update**: {{current_date}}
