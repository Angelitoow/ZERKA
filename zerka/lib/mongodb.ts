import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ Variable de entorno MONGODB_URI no está definida. Añádela a .env.local, p.ej. MONGODB_URI=mongodb://usuario:clave@localhost:27017/zerka"
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    } as const;
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Conexión a MongoDB establecida");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

