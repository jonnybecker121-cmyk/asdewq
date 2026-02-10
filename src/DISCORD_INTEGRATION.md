# 🔔 Discord Integration - Bewegungs-Log Benachrichtigungen

## Übersicht

Das SCHMELZDEPOT Business Management System verfügt über eine vollständige Discord Webhook Integration, die automatische Benachrichtigungen bei Änderungen im Bewegungs-Log (Inventory) sendet.

## Features

### ✅ Automatische Benachrichtigungen
- 📦 **Bewegungs-Log**: Echtzeit-Benachrichtigungen bei Inventory-Änderungen
- 🎨 **Farbcodiert**: Grün für Zunahme, Rot für Abnahme
- 📊 **Detailliert**: Zeigt Vorher/Nachher-Werte und Änderungsmenge
- 🏷️ **Kategorien**: Gold, Silber, Artikel, Maschinen

### 🎯 Filter-Optionen
- ✏️ **Manuelle Änderungen**: Benachrichtigungen für manuell eingetragene Bewegungen
- 🔄 **API-Checks**: Benachrichtigungen für automatische API-Prüfungen
- 🚨 **Bewegung erkannt**: Benachrichtigungen für unerwartete Bewegungen
- 📏 **Schwellenwert**: Nur Änderungen >= konfigurierbarem Wert werden gemeldet

### 🔐 Sicherheit
- 🔒 Webhook URL wird verschlüsselt gespeichert
- ☁️ Multi-User synchronisiert über Supabase
- 🚫 Keine API Keys erforderlich

## Setup

### 1️⃣ Discord Webhook erstellen

1. Öffne deinen Discord Server
2. Gehe zu **Server-Einstellungen** → **Integrationen** → **Webhooks**
3. Klicke auf **"Neuer Webhook"**
4. Wähle den Channel für Benachrichtigungen (z.B. `#inventory-logs`)
5. Kopiere die **Webhook URL**

### 2️⃣ Integration im System aktivieren

1. Öffne **Einstellungen** im SCHMELZDEPOT System
2. Scrolle zu **"Discord Integration"**
3. Füge die Webhook URL ein
4. Klicke auf **"Test senden"** um die Verbindung zu prüfen
5. Klicke auf **"Speichern"**
6. Aktiviere die Integration mit dem Switch

### 3️⃣ Benachrichtigungs-Typen konfigurieren

Wähle aus, welche Ereignisse benachrichtigt werden sollen:

- **✏️ Manuelle Änderungen**: Standard **AN** - Benachrichtigung bei manuellen Inventory-Änderungen
- **🔄 API-Prüfungen**: Standard **AUS** - Benachrichtigung bei automatischen API-Checks
- **🚨 Bewegung erkannt**: Standard **AN** - Benachrichtigung bei erkannten unerwarteten Bewegungen

### 4️⃣ Schwellenwert festlegen

Setze die minimale Änderungsmenge für Benachrichtigungen (Standard: **1**):

```
Nur Änderungen >= Schwellenwert werden benachrichtigt
```

## Discord Nachricht Format

### Embed Structure

```json
{
  "title": "🚨 Bewegung erkannt",
  "description": "Details zur Änderung...",
  "color": 0x00ff00,
  "fields": [
    {
      "name": "📦 Artikel",
      "value": "🥇 Gold Barren 1kg",
      "inline": true
    },
    {
      "name": "📊 Kategorie",
      "value": "Gold",
      "inline": true
    },
    {
      "name": "📉 Vorher",
      "value": "150",
      "inline": true
    },
    {
      "name": "📈 Änderung",
      "value": "+25",
      "inline": true
    },
    {
      "name": "📊 Nachher",
      "value": "175",
      "inline": true
    }
  ],
  "timestamp": "2025-11-05T10:30:00.000Z",
  "footer": {
    "text": "SCHMELZDEPOT Business Management System"
  }
}
```

### Farben

- 🟢 **Grün** (`0x00ff00`): Zunahme (positive Änderung)
- 🔴 **Rot** (`0xff0000`): Abnahme (negative Änderung)
- ⚪ **Grau** (`0x808080`): Keine Änderung

### Icons

- ✏️ Manuelle Änderung
- 🔄 API-Prüfung
- 🚨 Bewegung erkannt
- 🥇 Gold
- 🥈 Silber
- 📦 Artikel
- ⚙️ Maschine

## Technische Details

### Komponenten

```
/components/
├── services/
│   └── discordNotifier.ts          # Discord Webhook Integration
├── store/
│   ├── inventoryStore.ts            # Inventory Store mit Discord Hook
│   └── settingsStore.ts             # Settings Store mit Discord Settings
└── DiscordSettings.tsx              # UI für Discord Konfiguration
```

### Workflow

1. **Inventory Änderung** → `inventoryStore.addLog()`
2. **Hook triggered** → `discordNotifier.sendInventoryNotification()`
3. **Filter prüfen** → Typ, Schwellenwert
4. **Embed erstellen** → Formatierung mit Icons & Farben
5. **Discord senden** → Webhook POST Request
6. **Logging** → Console Output bei Erfolg/Fehler

### Multi-User Synchronisation

Die Discord Settings werden automatisch über das Supabase Backend synchronisiert:

```typescript
// Alle User sehen dieselben Discord Settings
discordSettings: {
  enabled: boolean,
  webhookUrl: string,
  notifyOnManual: boolean,
  notifyOnApiCheck: boolean,
  notifyOnMovementDetected: boolean,
  minChangeThreshold: number
}
```

## Beispiele

### Test-Benachrichtigung

```typescript
await discordNotifier.sendTestNotification(webhookUrl);
```

Sendet eine orange Test-Nachricht (#ff8000) zur Bestätigung der Integration.

### Automatische Benachrichtigung

```typescript
// Bei jeder Inventory-Änderung wird automatisch geprüft:
inventoryStore.addLog({
  type: 'movement_detected',
  category: 'gold',
  item: 'Gold Barren 1kg',
  change: 25,
  previousQuantity: 150,
  newQuantity: 175,
  details: 'Unerwartete Bestandsänderung erkannt'
});

// → Discord Benachrichtigung wird automatisch gesendet (falls aktiviert)
```

## Troubleshooting

### ❌ Test-Benachrichtigung schlägt fehl

**Problem**: "Test fehlgeschlagen - Prüfe die Webhook URL"

**Lösung**:
1. Stelle sicher, dass die Webhook URL korrekt ist
2. Format: `https://discord.com/api/webhooks/...`
3. Prüfe, ob der Webhook noch existiert (nicht gelöscht wurde)
4. Überprüfe Netzwerkverbindung

### ⚠️ Keine Benachrichtigungen erhalten

**Problem**: Integration ist aktiv, aber keine Nachrichten kommen an

**Lösung**:
1. Prüfe ob der richtige Channel ausgewählt ist
2. Stelle sicher, dass die Integration aktiviert ist (Switch = ON)
3. Überprüfe die Filter-Einstellungen (notifyOn...)
4. Prüfe den Schwellenwert (evtl. zu hoch gesetzt)
5. Schaue in die Browser Console nach Fehler-Logs

### 🔄 Multi-User Konflikte

**Problem**: Verschiedene User haben unterschiedliche Discord Settings

**Lösung**:
- Das System synchronisiert automatisch über Supabase
- Nach Änderung warten bis Sync abgeschlossen ist (ca. 1-2 Sekunden)
- Bei Problemen: Browser neu laden

## Best Practices

### 🎯 Empfohlene Konfiguration

```
✅ Manuelle Änderungen: AN
❌ API-Prüfungen: AUS (zu viele Benachrichtigungen)
✅ Bewegung erkannt: AN
📏 Schwellenwert: 5 (vermeidet Spam bei kleinen Änderungen)
```

### 📢 Channel-Empfehlungen

- **#inventory-alerts**: Für wichtige Bewegungs-Logs
- **#inventory-all**: Für alle Änderungen (wenn gewünscht)
- **#admin-logs**: Für administrative Benachrichtigungen

### 🔕 Spam vermeiden

- Setze den Schwellenwert angemessen (z.B. 5-10)
- Deaktiviere API-Check Benachrichtigungen im Produktivbetrieb
- Nutze Discord's Notification Settings für den Channel

## Support

Bei Problemen oder Fragen:
1. Prüfe die Browser Console auf Fehler
2. Teste die Webhook URL mit dem "Test senden" Button
3. Überprüfe die Discord Server Berechtigungen
4. Kontaktiere den Support mit Console-Logs

---

**Version**: 1.0.0  
**Letzte Aktualisierung**: November 2025  
**Kompatibilität**: Discord Webhook API v10
