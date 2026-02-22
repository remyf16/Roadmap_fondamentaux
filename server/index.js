// server/index.js
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Optionnels (sinon valeurs par défaut)
const DB_NAME = process.env.MONGODB_DB || "roadmap";
const COLLECTION = process.env.MONGODB_COLLECTION || "app_state";
const DOC_ID = process.env.APP_STATE_ID || "default";

if (!MONGODB_URI) {
  console.error("Missing env var: MONGODB_URI");
  process.exit(1);
}

let client;
let col;

async function initMongo() {
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  col = db.collection(COLLECTION);
  console.log("Mongo connected:", DB_NAME, COLLECTION);
}

app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Récupère l’état
app.get("/api/state", async (_req, res) => {
  try {
    const doc = await col.findOne({ _id: DOC_ID });
    res.json(doc?.state ?? null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read state" });
  }
});

// Sauvegarde l’état (remplace le document)
app.post("/api/state", async (req, res) => {
  try {
    const state = req.body;
    await col.updateOne(
      { _id: DOC_ID },
      { $set: { state, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save state" });
  }
});

initMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  })
  .catch((e) => {
    console.error("Mongo init failed", e);
    process.exit(1);
  });
