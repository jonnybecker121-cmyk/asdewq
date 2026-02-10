# 🗄️ DATABASE SETUP GUIDE

Die App benötigt eine Datenbank-Tabelle in Supabase. Folge diesen Schritten:

## ✅ Schritt 1: Supabase SQL Editor öffnen

1. Gehe zu https://supabase.com
2. Öffne dein Projekt
3. Navigiere zu **SQL Editor** (links im Menü)

## ✅ Schritt 2: SQL ausführen

Kopiere den folgenden SQL-Code und führe ihn aus:

```sql
-- ========================================
-- KV-STORE TABLE FÜR SCHMELZDEPOT
-- ========================================

-- Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.kv_store_9acd92e5 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellere Prefix-Suche
CREATE INDEX IF NOT EXISTS kv_store_9acd92e5_key_prefix_idx 
  ON public.kv_store_9acd92e5 (key text_pattern_ops);

-- Index für timestamp-basierte Queries
CREATE INDEX IF NOT EXISTS kv_store_9acd92e5_updated_at_idx 
  ON public.kv_store_9acd92e5 (updated_at DESC);

-- Automatisches Update von updated_at
CREATE OR REPLACE FUNCTION update_kv_store_9acd92e5_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatisches Update
DROP TRIGGER IF EXISTS update_kv_store_9acd92e5_updated_at_trigger 
  ON public.kv_store_9acd92e5;

CREATE TRIGGER update_kv_store_9acd92e5_updated_at_trigger
  BEFORE UPDATE ON public.kv_store_9acd92e5
  FOR EACH ROW
  EXECUTE FUNCTION update_kv_store_9acd92e5_updated_at();

-- RLS (Row Level Security) aktivieren
ALTER TABLE public.kv_store_9acd92e5 ENABLE ROW LEVEL SECURITY;

-- Policy: Service Role hat vollen Zugriff
CREATE POLICY "Service role has full access"
  ON public.kv_store_9acd92e5
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users haben vollen Zugriff
CREATE POLICY "Authenticated users have full access"
  ON public.kv_store_9acd92e5
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Anon users haben vollen Zugriff (für Development)
-- ⚠️ IN PRODUCTION: Diese Policy entfernen oder einschränken!
CREATE POLICY "Anon users have full access (DEV ONLY)"
  ON public.kv_store_9acd92e5
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Kommentar zur Dokumentation
COMMENT ON TABLE public.kv_store_9acd92e5 IS 
  'Key-Value Store für SCHMELZDEPOT Business Suite - Server-basierte Datenhaltung';
```

## ✅ Schritt 3: Tabelle verifizieren

1. Navigiere zu **Table Editor** (links im Menü)
2. Suche nach `kv_store_9acd92e5`
3. Die Tabelle sollte nun existieren und leer sein

## ✅ Schritt 4: App neustarten

1. Refresh die App im Browser
2. Der Server Connection Status sollte jetzt **grün** (Online) sein
3. Alle LiveSync-Fehler sollten verschwunden sein

## 🔐 Production Setup (Optional)

Für Production solltest du die Anon-Policy einschränken:

```sql
-- Lösche die offene Anon-Policy
DROP POLICY IF EXISTS "Anon users have full access (DEV ONLY)" 
  ON public.kv_store_9acd92e5;

-- Erstelle restriktive Policy (nur lesen erlaubt)
CREATE POLICY "Anon users can read only"
  ON public.kv_store_9acd92e5
  FOR SELECT
  TO anon
  USING (true);
```

## 🧪 Testen

Du kannst die Tabelle im SQL Editor testen:

```sql
-- Test: Daten einfügen
INSERT INTO public.kv_store_9acd92e5 (key, value)
VALUES ('test:hello', '{"message": "Hello World!"}'::jsonb);

-- Test: Daten lesen
SELECT * FROM public.kv_store_9acd92e5 WHERE key = 'test:hello';

-- Test: Daten löschen
DELETE FROM public.kv_store_9acd92e5 WHERE key = 'test:hello';
```

## ❓ Troubleshooting

### Fehler: "permission denied"
- Stelle sicher, dass RLS aktiviert ist
- Prüfe ob die Policies erstellt wurden
- Verwende den Service Role Key im Backend

### Fehler: "table does not exist"
- Führe das CREATE TABLE Statement nochmal aus
- Prüfe ob du im richtigen Projekt bist
- Checke in Table Editor ob die Tabelle existiert

### Server bleibt offline
- Prüfe Edge Function Logs im Dashboard
- Stelle sicher, dass die Tabelle erstellt wurde
- Verifiziere SUPABASE_URL und Keys

## 📊 Monitoring

Im Supabase Dashboard kannst du:
- Anzahl der Einträge sehen (Table Editor)
- API-Calls monitoren (API Logs)
- Performance tracken (Metrics)

---

**Geschafft! 🎉** Deine Datenbank ist jetzt ready!
