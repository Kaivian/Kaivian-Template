// server/src/config/env.js
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// 1. Load root-level .env
// 2. Load backend-level .env (override if conflicts)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Application environment configuration.
 * Values are loaded from `.env` files and `process.env`.
 * Backend `.env` overrides root `.env`.
 *
 * @typedef {Object} EnvConfig
 * @property {string} APP_NAME - Application name (default: "app")
 * @property {number} PORT - Port the server runs on (default: 5000)
 * @property {string} NODE_ENV - Runtime environment ("development" | "production" | "test")
 * @property {string} CORS_ORIGIN - Allowed CORS origin (default: "http://localhost:3000")
 *
 * @property {string} JWT_SECRET - Secret for signing access tokens
 * @property {string} JWT_EXPIRES_IN - Access token expiration (e.g., "15m")
 * @property {string} JWT_REFRESH_SECRET - Secret for signing refresh tokens
 * @property {string} JWT_REFRESH_EXPIRES_IN - Refresh token expiration (e.g., "7d")
 *
 * @property {string} MONGO_URI - Base MongoDB connection URI
 * @property {string} MONGO_DB_NAME - Database name (default: "development")
 * @property {string|number} MONGO_MAX_POOL - Mongo connection pool size (default: 20)
 * @property {string|number} MONGO_SSTM - Mongo server selection timeout in ms (default: 10000)
 *
 * @property {string} LOG_LEVEL - Logging level ("debug" | "info" | "warn" | "error")
 */

/** @type {EnvConfig} */
export const env = {
  APP_NAME: process.env.APP_NAME || "app",
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  JWT_SECRET: process.env.JWT_ACCESS_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  MONGO_URI: process.env.MONGO_URI || "",
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "development",
  MONGO_MAX_POOL: process.env.MONGO_MAX_POOL || "20",
  MONGO_SSTM: process.env.MONGO_SSTM || "10000",

  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};