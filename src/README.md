# 🔥 SCHMELZDEPOT Business Suite

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Zustand](https://img.shields.io/badge/State-Zustand-ff8000?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

**Business Management System** mit Auftragsverwaltung, Rechnungserstellung und Lagerverwaltung.

## 🚀 Schnellstart

```bash
npm install
npm run dev
```

Die App öffnet sich automatisch auf `http://localhost:5173`

---

## ✨ Features

### 📊 **Dashboard**
- Live-Marktdaten von StateV.de API
- Verkaufs- und Kaufangebote in Echtzeit
- Kauf-Historie und Statistiken
- Quick-Actions für alle Module

### 🛒 **Auftragsmanagement**
- Vollständige Auftragsverwaltung (Offen/Erledigt/Archiviert)
- Automatische Steuerberechnung (+5%)
- Status-Tracking mit Timer
- CSV-Export aller Aufträge
- Automatische Archivierung nach 90 Tagen

### 📄 **Rechnungsgenerator**
- PNG-Export mit perfektem Layout
- SCHMELZDEPOT-Branding (#ff8000)
- Automatische VBAN-Zahlungsreferenz
- Progressive Tabellenerweiterung
- Orangene Tabellenheader (#ff8000)

### 📦 **Lagerverwaltung**
- Live-Integration mit StateV.de Inventar-API
- Gold-, Silber- und Item-Tracking
- Echtzeit-Synchronisation
- Verkaufs-/Einkaufshistorie

### 👥 **Mitarbeiterverwaltung**
- Mitarbeiter-Datenbank
- Kontaktinformationen
- Visitenkarten-Links

### 💰 **Bankmanagement**
- Finanzübersicht
- Transaktions-Historie
- Live-Statistiken und Charts
- Automatische Zahlungserkennung

### 🗄️ **Archiv-System**
- Automatische Archivierung nach 90 Tagen
- Wiederherstellungsfunktion
- Endgültige Löschung nach Mitternacht (Auto-Cleanup)
- CSV-Export

### 🧮 **Preiskalkulator**
- EK zu VK Umrechnung mit +5% Steuer
- Bulk-Berechnung
- Gewinn-Kalkulation
- Preis-Historie

### ⚙️ **Einstellungen**
- Auto-Payment System für StateV.de
- 10-Minuten-Backup-System
- Universal-Backup mit Mitternachts-Cleanup
- Tab-Sichtbarkeits-Manager
- Bestellnummern-Konfiguration
- Development-Modus mit Debug-Tools
- Performance-Dashboard

---

## 🎨 Design-System

### Corporate Identity
- **Primary Color:** `#ff8000` (Orange)
- **Dark Mode:** Schwarzer Hintergrund (`#000000`)
- **Font System:** Responsive Typography (16-21px)

### UI-Framework
- **React 18** mit TypeScript
- **Tailwind CSS v4** mit Custom Tokens
- **shadcn/ui** Komponenten-Bibliothek
- **Zustand** für State-Management
- **Recharts** für Visualisierungen

---

## 📁 Projekt-Struktur

```
├── App.tsx                    # Haupt-Entry-Point mit Navigation
├── components/
│   ├── Dashboard.tsx          # Dashboard mit Live-Daten
│   ├── OrderManager.tsx       # Auftragsverwaltung
│   ├── InvoiceManager.tsx     # Rechnungsgenerator
│   ├── InventoryManager.tsx   # Lagerverwaltung
│   ├── BankManager.tsx        # Finanzmanagement
│   ├── ArchiveManager.tsx     # Archiv-System
│   ├── EmployeeManager.tsx    # Mitarbeiter-DB
│   ├── PriceCalculator.tsx    # Preiskalkulator
│   ├── SettingsManager.tsx    # Einstellungen
│   ├── Invoice.tsx            # PNG-Generator
│   ├── store/
│   │   ├── orderStore.ts      # Hauptdaten-Store
│   │   ├── invoiceStore.ts    # Rechnungs-Store
│   │   └── tabVisibilityStore.ts
│   ├── services/
│   │   └── statevApi.ts       # StateV.de API-Client
│   └── ui/                    # shadcn/ui Komponenten
├── styles/
│   └── globals.css            # Tailwind v4 Config + Themes
└── utils/                     # Helper & Hooks
```

---

## 🔧 Technische Details

### State-Management
- **🌐 Server-basiert** - Vollständige Backend-Integration über Supabase
- **🔄 LiveSync** - Multi-User Echtzeit-Synchronisierung
- **☁️ Cloud Storage** - Alle Daten zentral auf Server
- **🔁 Automatic Backups** - Server-basiert, keine localStorage-Quota-Probleme
- **📡 REST API** - Vollständige API für alle Entitäten

### API-Integration
- **Supabase Backend** - KV-Store basierte Datenhaltung
- **StateV.de API** für Marktdaten
- **Automatische Retry-Logik**
- **Fehlerbehandlung mit Fallbacks**
- **Connection Monitoring** - Live-Status-Anzeige

### Performance
- **Lazy Loading** aller Hauptkomponenten
- **Code-Splitting** automatisch
- **Optimistic Updates** für bessere UX
- **Debounced Input** für Such-Funktionen

### Backup-System
- **Server-basierte Backups:** Keine localStorage-Quota-Probleme
- **10-Minuten-Backups:** Automatisch alle 10 Minuten auf Server
- **Universal-Backup:** Tägliche Snapshots auf Supabase
- **Auto-Cleanup:** Alte Backups >24h werden um Mitternacht gelöscht
- **Archiv-Cleanup:** Archivierte Aufträge >24h werden um Mitternacht gelöscht

### Multi-User Support
- **LiveSync-System** - Änderungen werden über Server synchronisiert
- **Last-Write-Wins** - Konfliktlösung durch Timestamp-basierte Versionierung
- **Polling-basiert** - Automatisches Laden von Server-Updates alle 5 Sekunden
- **Connection Status** - Visueller Indikator für Server-Verbindung

---

## 💾 Daten-Struktur

### Server-basierte Storage (Supabase KV-Store)
```
order:*                  # Aufträge (Offen/Erledigt/Archiviert)
customer:*               # Kundendatenbank
item:*                   # Artikeldatenbank
inventory:*              # Inventar-Items
invoice:*                # Rechnungsdaten
employee:*               # Mitarbeiterdaten
calculator:*             # Preisrechner-Einträge
bank:account:*           # Bank-Konten
bank:transaction:*       # Transaktionen
setting:*                # System-Einstellungen
live-sync:*              # LiveSync-Daten für Multi-User
backup:tab:*             # Tab-spezifische Backups
backup:full:*            # Vollständige App-Backups
```

### API-Endpunkte
Siehe [SERVER_HOSTING_GUIDE.md](./SERVER_HOSTING_GUIDE.md) für vollständige API-Dokumentation.

---

## 🎯 Verwendung

### Neuen Auftrag erstellen
1. **Dashboard** oder **Aufträge** öffnen
2. Kunde und Artikel aus Dropdowns wählen
3. Menge eingeben → Steuer (+5%) wird automatisch berechnet
4. "Auftrag erstellen" klicken

### Rechnung generieren
1. **Rechnungen** öffnen
2. Auftrag aus Dropdown wählen (Offene + Erledigte)
3. Felder werden automatisch ausgefüllt
4. "PNG-Rechnung generieren" klicken
5. Download startet automatisch

### Auto-Payment aktivieren
1. **Einstellungen** öffnen
2. "Automatische Zahlungsverarbeitung" aktivieren
3. Check-Intervall auf 10 Minuten einstellen
4. System prüft automatisch StateV.de Transaktionen

### Backup wiederherstellen
1. **Einstellungen** → **Backup-Manager**
2. Gewünschten Snapshot wählen
3. "Wiederherstellen" klicken
4. Bestätigen

---

## 🔐 Sicherheit

- **Supabase Backend** - Sichere Cloud-Infrastruktur
- **Bearer Token Auth** - Alle Requests authentifiziert
- **Service Role Key** - Nur Server hat vollen Zugriff
- **Private Buckets** - Sichere Storage mit signed URLs
- **CORS-aktiviert** - Sichere Cross-Origin-Requests
- **Keine externen API-Keys im Frontend** - Alle sensiblen Keys auf Server

---

## 🚨 Wichtige Hinweise

### Rechnungsgenerator
- **VBAN:** Fest codiert als `VBAN-409856`
- **Steuersatz:** Fix +5% auf alle Beträge
- **Footer:** Immer am unteren Rand fixiert
- **Tabellenheader:** Orange (#ff8000)

### Auto-Archivierung
- Aufträge werden nach **90 Tagen** automatisch archiviert
- Archivierte Aufträge werden nach **24h** um Mitternacht endgültig gelöscht
- Backups werden nach **24h** um Mitternacht gelöscht

### StateV.de API
- Erfordert gültige Session
- Daten werden alle 30 Sekunden aktualisiert
- Bei Fehler werden Fallback-Daten angezeigt

---

## 📱 Browser-Kompatibilität

- ✅ Chrome/Edge (empfohlen)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile Browser (responsive)

---

## 🎨 Themes

### Light Mode
- Heller Hintergrund (#fafafa)
- Schwarzer Text
- Orange Akzente (#ff8000)

### Dark Mode
- **Schwarzer Hintergrund** (#000000) ✅
- Weißer Text
- Orange Akzente (#ff8000)

---

## 🛠️ Development

### Build für Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

---

## 📝 Version

**Version 2.0 PRO (Server-Hosting Edition)**
- ✅ Vollständig production-ready
- ✅ Alle 9 Module funktional
- ✅ **Server-basiert** mit Supabase Backend
- ✅ **Multi-User Support** mit LiveSync
- ✅ **Cloud-Backups** - Keine localStorage-Quota-Probleme
- ✅ **REST API** - Vollständige Backend-Integration
- ✅ **Connection Monitoring** - Live-Status-Anzeige
- ✅ Auto-Backup-System
- ✅ Dark Mode Support
- ✅ Responsive Design

### 🆕 Neu in Version 2.0
- 🌐 **Vollständiges Server-Backend** über Supabase Edge Functions
- 🔄 **Multi-User LiveSync** - Echtzeit-Synchronisierung zwischen Benutzern
- ☁️ **Cloud Storage** - Zentrale Datenhaltung auf Server
- 📡 **REST API Client** - Zentraler API-Client für alle Stores
- 🔌 **Connection Status** - Visueller Indikator im Header
- 🧪 **API Test Tool** - Integriertes Testing für alle Endpunkte (Dev-Mode)
- 📊 **Server Monitoring** - Health-Checks und Sync-Status

### 📚 Dokumentation
- [SERVER_HOSTING_GUIDE.md](./SERVER_HOSTING_GUIDE.md) - Vollständige Server-Dokumentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment-Anleitung

---

## 🎉 Support

Bei Fragen oder Problemen:
1. Logs in Browser-Konsole prüfen
2. LocalStorage-Daten in DevTools inspizieren
3. Backup wiederherstellen falls nötig
4. Development-Modus aktivieren für Debug-Tools

---

**Made with ❤️ for SCHMELZDEPOT**
