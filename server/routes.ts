import type { Request, Response } from "express";
import { getDb } from "./db";

const COLLECTION = "roadmap_states";
const DOC_ID = "main"; // simple (plus tard tu peux gérer users / workspaces)

export async function getState(_req: Request, res: Response) {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ _id: DOC_ID });

  // Si rien en DB, renvoie un état vide
  res.json(doc?.data ?? null);
}

export async function putState(req: Request, res: Response) {
  const data = req.body;

  const db = await getDb();
  await db.collection(COLLECTION).updateOne(
    { _id: DOC_ID },
    { $set: { data, updatedAt: new Date() } },
    { upsert: true }
  );

  res.json({ ok: true });
}
