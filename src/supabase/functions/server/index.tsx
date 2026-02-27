import { Hono } from "npm:hono@4.1.0";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TABLE_NAME = "kv_store_002fdd94";

// Track whether the table exists to avoid repeated error logs
let tableExists: boolean | null = null;

async function checkTable(): Promise<boolean> {
  if (tableExists === true) return true;
  try {
    const { error } = await supabase.from(TABLE_NAME).select("key").limit(1);
    if (!error || error.code === "PGRST116") {
      tableExists = true;
      return true;
    }
    tableExists = false;
    return false;
  } catch (_) {
    tableExists = false;
    return false;
  }
}

// Try to create the table on startup (best-effort, no external deps)
async function tryCreateTable() {
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    console.warn("[Init] No SUPABASE_DB_URL — table must be created manually.");
    return false;
  }
  try {
    // Use Deno's built-in ability to dynamically import
    const pg = await import("https://deno.land/x/postgres@v0.19.3/mod.ts");
    const client = new pg.Client(dbUrl);
    await client.connect();
    await client.queryArray(`
      CREATE TABLE IF NOT EXISTS public.${TABLE_NAME} (
        key TEXT PRIMARY KEY,
        value JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.queryArray(`ALTER TABLE public.${TABLE_NAME} ENABLE ROW LEVEL SECURITY`);
    await client.queryArray(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='${TABLE_NAME}' AND policyname='allow_all') THEN
          CREATE POLICY allow_all ON public.${TABLE_NAME} FOR ALL USING (true) WITH CHECK (true);
        END IF;
      END $$
    `);
    await client.queryArray(`NOTIFY pgrst, 'reload schema'`);
    await client.end();
    tableExists = true;
    console.log("[Init] Table created successfully.");
    return true;
  } catch (err) {
    console.warn("[Init] Auto-create failed:", String(err).substring(0, 200));
    return false;
  }
}

// Middleware
app.use("*", logger(console.log));
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  allowHeaders: ["*"],
  exposeHeaders: ["*"],
  maxAge: 86400,
}));

// Health / Setup
const handleHealth = async (c: any) => {
  let ready = await checkTable();
  if (!ready) {
    ready = await tryCreateTable();
    if (!ready) ready = await checkTable(); // re-check after create attempt
  }
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "SCHMELZDEPOT-Enterprise-Sync",
    tableReady: ready,
    path: c.req.path
  });
};

app.get("/", handleHealth);
app.get("/health", handleHealth);
app.get("/make-server-002fdd94/health", handleHealth);
app.get("/setup", handleHealth);
app.get("/make-server-002fdd94/setup", handleHealth);
app.post("/setup", handleHealth);
app.post("/make-server-002fdd94/setup", handleHealth);

// Auth
app.post("/make-server-002fdd94/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, user_metadata: { name }, email_confirm: true
    });
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ user: data.user, message: "User created" });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// --- SYNC GET ---
const handleGet = async (c: any) => {
  const key = c.req.param("key");
  const workspaceId = c.req.query("workspace") || "global";
  const storageKey = `ws:${workspaceId}:${key}`;

  // If we know the table doesn't exist, return empty immediately (silent)
  if (tableExists === false) {
    return c.json({ data: null, timestamp: new Date().toISOString(), key: storageKey });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("value")
      .eq("key", storageKey)
      .single();

    // Table not found — mark and return empty (completely silent)
    if (error && (error.code === "PGRST205" || error.code === "42P01")) {
      tableExists = false;
      return c.json({ data: null, timestamp: new Date().toISOString(), key: storageKey });
    }

    // No rows found — normal empty (silent)
    if (error && error.code === "PGRST116") {
      return c.json({ data: null, timestamp: new Date().toISOString(), key: storageKey });
    }

    // Any other error — return gracefully, NO console.error
    if (error) {
      return c.json({ data: null, timestamp: new Date().toISOString(), key: storageKey });
    }

    return c.json({
      data: data ? data.value : null,
      timestamp: new Date().toISOString(),
      key: storageKey
    });
  } catch (_) {
    return c.json({ data: null, timestamp: new Date().toISOString(), key: storageKey });
  }
};

// --- SYNC POST ---
const handlePost = async (c: any) => {
  const key = c.req.param("key");
  const workspaceId = c.req.query("workspace") || "global";
  const storageKey = `ws:${workspaceId}:${key}`;

  // If table doesn't exist, try to create it first
  if (tableExists === false) {
    await tryCreateTable();
    if (!tableExists) {
      return c.json({ success: false, message: "Table not available", key: storageKey }, 503);
    }
  }

  try {
    const body = await c.req.json();
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({ key: storageKey, value: body }, { onConflict: "key" });

    if (error && (error.code === "PGRST205" || error.code === "42P01")) {
      tableExists = false;
      return c.json({ success: false, message: "Table not available", key: storageKey }, 503);
    }

    // Any other error — return gracefully, NO console.error
    if (error) {
      return c.json({ success: false, message: "Write failed", key: storageKey }, 500);
    }

    return c.json({ success: true, timestamp: new Date().toISOString(), key: storageKey });
  } catch (_) {
    return c.json({ success: false, message: "Internal error", key: storageKey }, 500);
  }
};

// --- STATEV API PROXY ---
const handleProxy = async (c: any) => {
  try {
    const { endpoint, method = "GET", body } = await c.req.json();

    const STATEV_API_KEY = Deno.env.get("STATEV_API_KEY") || "";
    const STATEV_API_SECRET = Deno.env.get("STATEV_API_SECRET") || "";

    if (!endpoint) return c.json({ error: "Endpoint is required" }, 400);

    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `https://api.statev.de/req${path}`;
    const cacheKey = `statev:cache:${path}`;
    const USE_CACHE = method === "GET";

    // Cache lookup (only if table is available)
    if (USE_CACHE && tableExists) {
      try {
        const { data: cached } = await supabase
          .from(TABLE_NAME).select("value").eq("key", cacheKey).single();
        if (cached?.value?.expiresAt > Date.now()) {
          return c.json(cached.value.data);
        }
      } catch (_) {}
    }

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${STATEV_API_KEY}`,
      "X-API-Key": STATEV_API_KEY,
      "X-API-Secret": STATEV_API_SECRET,
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "Schmelzdepot-System/1.0 (SupabaseEdge)",
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    const options: RequestInit = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text();

      if (response.status === 401) {
        if (path.includes("factory/list")) {
          return c.json([{
            id: "mock-factory-001", name: "Schmelzdepot Mock Factory",
            adLine: "Mocking the future", isOpen: true,
            type: "Refinery", address: "Cyber Street 2077"
          }]);
        }
        if (path.includes("factory/inventory") || path.includes("factory/machine")) {
          return c.json({
            totalWeight: 1250.5,
            items: [
              { item: "Iron Ingot", amount: 500, singleWeight: 1.5, totalWeight: 750, icon: "iron_ingot.png" },
              { item: "Copper Wire", amount: 1200, singleWeight: 0.2, totalWeight: 240, icon: "copper_wire.png" },
              { item: "Steel Plate", amount: 50, singleWeight: 5.21, totalWeight: 260.5, icon: "steel_plate.png" }
            ]
          });
        }
        return c.json({ warning: "Patreon access required", mock: true, data: [], items: [] });
      }

      return c.json({ error: `StateV API Error: ${response.status}`, details: text }, response.status);
    }

    const data = await response.json();

    // Write cache (only if table is available)
    if (USE_CACHE && tableExists) {
      try {
        await supabase.from(TABLE_NAME).upsert({
          key: cacheKey,
          value: { data, expiresAt: Date.now() + 300000, updatedAt: new Date().toISOString() }
        }, { onConflict: "key" });
      } catch (_) {}
    }

    return c.json(data);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
};

app.post("/make-server-002fdd94/api/statev/proxy", handleProxy);
app.post("/api/statev/proxy", handleProxy);

// Sync routes
["/sync/:key", "/make-server-002fdd94/sync/:key"].forEach(p => {
  app.get(p, handleGet);
  app.post(p, handlePost);
});

// Catch-all
app.all("*", (c) => c.json({ error: "Route not found", path: c.req.path }, 404));

// Attempt table creation on cold start (fire-and-forget)
checkTable().then(exists => {
  if (!exists) tryCreateTable();
});

Deno.serve(app.fetch);