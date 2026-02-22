import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("Missing MONGODB_URI env var");

let client: MongoClient | null = null;

export async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  // choisis un nom de DB explicite si tu veux, sinon Mongo prendra celui de l'URI
  return client.db(process.env.MONGODB_DB || undefined);
}
