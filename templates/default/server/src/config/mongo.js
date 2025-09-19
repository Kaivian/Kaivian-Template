// server/src/config/mongo.js
import { env } from "./env.js";
import mongoose from "mongoose";
import AppError from "../utils/errors/appError.js";
import { info, err as logError } from "../utils/logger.js";

const { MONGO_URI, MONGO_DB_NAME, MONGO_MAX_POOL, MONGO_SSTM } = env;

if (!MONGO_URI) {
  throw new AppError("❌ [mongo] Missing required env: MONGO_URI", 500);
}
if (!MONGO_DB_NAME) {
  throw new AppError("❌ [mongo] Missing required env: MONGO_DB_NAME", 500);
}

let connected = false;

/**
 * Establishes a MongoDB connection (singleton).
 * Ensures only one connection is created and reused across the app.
 *
 * @async
 * @function connectOnce
 * @returns {Promise<mongoose.Connection>} Mongoose connection instance
 * @throws {AppError} If the connection fails
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
    info(`✅ [mongo] Connected to database: ${MONGO_DB_NAME}`);
    return mongoose.connection;
  } catch (error) {
    logError("❌ [mongo] Connection error:", error);
    throw new AppError(`MongoDB connection failed: ${error.message}`, 500);
  }
}

/**
 * Gracefully disconnects from MongoDB if connected.
 *
 * @async
 * @function disconnect
 * @returns {Promise<void>}
 * @throws {AppError} If disconnect fails
 */
export async function disconnect() {
  if (!connected) return;

  try {
    await mongoose.disconnect();
    connected = false;
    info("✅ [mongo] Disconnected from database");
  } catch (error) {
    logError("❌ [mongo] Disconnect error:", error);
    throw new AppError(`MongoDB disconnect failed: ${error.message}`, 500);
  }
}

export { mongoose };