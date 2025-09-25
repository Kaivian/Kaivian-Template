// client/config/config.ts

/**
 * Frontend environment configuration for Next.js
 * 
 * Reads environment variables starting with NEXT_PUBLIC_ from `.env.local` or
 * `.env.production`. Provides type-safe access to important frontend config values.
 * 
 * @module env
 */

/**
 * Type definition for frontend environment variables.
 */
export interface EnvConfig {
  /** Application name */
  APP_NAME: string;

  /** Backend API base URL */
  API_URL: string;

  /** Allowed CORS origin (frontend domain) */
  CORS_ORIGIN: string;

  /** JWT issuer (must match backend) */
  JWT_ISSUER: string;

  /** JWT audience (must match backend) */
  JWT_AUDIENCE: string;

  /** Logging level */
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
}

/**
 * Helper function to get environment variable by key.
 * Throws an error if the variable is missing and no default is provided.
 * 
 * @param {string} key - Environment variable key
 * @param {string} [defaultValue] - Default value if env variable is not set
 * @returns {string} - Environment variable value
 * @throws {Error} If variable is missing and no default is provided
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

/**
 * Frontend environment configuration object.
 * Access variables via `env.*` throughout the Next.js frontend.
 * 
 * Example:
 * ```ts
 * import { env } from "@/config/env";
 * console.log(env.API_URL);
 * ```
 */
export const env: EnvConfig = {
  APP_NAME: getEnvVar("NEXT_PUBLIC_APP_NAME", "next-frontend"),
  API_URL: getEnvVar("NEXT_PUBLIC_API_URL", "http://localhost:5000"),
  CORS_ORIGIN: getEnvVar("NEXT_PUBLIC_CORS_ORIGIN", "http://localhost:3000"),

  JWT_ISSUER: getEnvVar("NEXT_PUBLIC_JWT_ISSUER", "your-api.com"),
  JWT_AUDIENCE: getEnvVar("NEXT_PUBLIC_JWT_AUDIENCE", "your-client-app"),

  LOG_LEVEL: getEnvVar("NEXT_PUBLIC_LOG_LEVEL", "info") as EnvConfig["LOG_LEVEL"],
};