import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectMongo(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/';
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('ecommerce_catalog');
  console.log('[MongoDB] Connected to ecommerce_catalog');
  return db;
}

export function getMongo(): Db {
  if (!db) throw new Error('MongoDB not initialized');
  return db;
}
