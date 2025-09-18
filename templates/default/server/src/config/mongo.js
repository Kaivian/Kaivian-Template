// server/src/config/mongo.js
import { env } from "./env.js";
import mongoose from "mongoose";

const { MONGO_URI, MONGO_DB_NAME, MONGO_MAX_POOL, MONGO_SSTM } = env;

if (!MONGO_URI) {
  throw new Error("❌ [mongo] Missing required env: MONGO_URI");
}
if (!MONGO_DB_NAME) {
  throw new Error("❌ [mongo] Missing required env: MONGO_DB_NAME");
}

let connected = false;

/**
 * Establishes a MongoDB connection (singleton).
 * Ensures only one connection is created and reused across the app.
 *
 * @async
 * @function connectOnce
 * @returns {Promise<mongoose.Connection>} Mongoose connection instance
 * @throws {Error} If the connection fails
 */
export async function connectOnce() {
  if (connected) return mongoose.connection;

  // Normalize URI (avoid double slashes) and inject DB name
  const fullUri = `${MONGO_URI.replace(/\/+$/g, "")}/${encodeURIComponent(
    MONGO_DB_NAME
  )}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(fullUri, {
      maxPoolSize: Number(MONGO_MAX_POOL) || 20,
      serverSelectionTimeoutMS: Number(MONGO_SSTM) || 10000,
    });

    connected = true;
    console.info(`✅ [mongo] Connected to database: ${MONGO_DB_NAME}`);
    return mongoose.connection;
  } catch (err) {
    console.error("❌ [mongo] Connection error:", err);
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
}

/**
 * Gracefully disconnects from MongoDB if connected.
 *
 * @async
 * @function disconnect
 * @returns {Promise<void>}
 */
export async function disconnect() {
  if (!connected) return;

  try {
    await mongoose.disconnect();
    connected = false;
    console.info("✅ [mongo] Disconnected from database");
  } catch (err) {
    console.error("❌ [mongo] Disconnect error:", err);
    throw new Error(`MongoDB disconnect failed: ${err.message}`);
  }
}

export { mongoose };