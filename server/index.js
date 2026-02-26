// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ----- Paths (ESM) -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----- Env -----
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "roadmap";
const COLLECTION = process.env.MONGODB_COLLECTION || "state";
const STATE_ID = process.env.STATE_ID || "default";

if (!MONGODB_URI) {
  console.error("❌ Missing env var MONGODB_URI");
  process.exit(1);
}

// ----- Mongo (singleton) -----
let client;
let collection;

async function initMongo() {
  client = new MongoClient(MONGODB_URI, {
    // options safe for prod; ok with Atlas
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);

  console.log(`✅ Mongo connected db=${DB_NAME} collection=${COLLECTION}`);
}

// clean shutdown (Render sends SIGTERM)
async function shutdown() {
  try {
    if (client) await client.close();
  } catch {}
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// init Mongo before listening
await initMongo();

// ----- API -----
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/state", async (_req, res) => {
  try {
    const doc = await collection.findOne({ _id: STATE_ID });
    // si pas de doc => null (front hydrate ignore)
    return res.json(doc?.data ?? null);
  } catch (e) {
    console.error("GET /api/state failed", e);
    return res.status(500).json({ error: "failed_to_load" });
  }
});

app.post("/api/state", async (req, res) => {
  try {
    const data = req.body ?? null;

    // protection minimale : le front envoie un objet (AppData)
    if (data === null || typeof data !== "object") {
      return res.status(400).json({ error: "invalid_payload" });
    }

    await collection.updateOne(
      { _id: STATE_ID },
      { $set: { data, updatedAt: new Date() } },
      { upsert: true },
    );

    return res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/state failed", e);
    return res.status(500).json({ error: "failed_to_save" });
  }
});

// ----- Serve front (Vite build) -----
const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));

// SPA fallback: routes non-API => index.html
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).end();
  return res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
});
