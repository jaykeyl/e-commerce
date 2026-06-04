import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectMongo } from './db/mongodb';

const PORT = process.env.PORT || 3000;

async function main() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

main().catch(console.error);
