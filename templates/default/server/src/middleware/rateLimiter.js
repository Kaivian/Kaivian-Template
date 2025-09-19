// server/src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";
import { parseDuration } from "../utils/parseDuration.js";
import AppError from "../utils/errors/appError.js";
import { env } from "../config/env.js";

/**
 * Creates a standardized error response for rate limiting.
 *
 * @param {string} message - Human-readable error message.
 * @returns {AppError} An AppError instance with status 429.
 */
const rateLimitError = (message) =>
  new AppError(message, 429, { type: "RateLimitError" });

/**
 * Helper: return rate limiter only in production
 */
const withRateLimit =
  (options) =>
  env.NODE_ENV === "production"
    ? rateLimit(options)
    : (req, res, next) => next();

/**
 * General API rate limiter.
 *
 * - Production: Limits each IP to **100 requests per 15 minutes**.
 * - Dev/Test: Disabled.
 */
export const apiLimiter = withRateLimit({
  windowMs: parseDuration("15m"),
  max: 100,
  handler: (req, res, next) =>
    next(rateLimitError("Too many requests, please try again later.")),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication-specific rate limiter.
 *
 * - Production: Limits each IP to **5 requests per 5 minutes**.
 * - Dev/Test: Disabled.
 */
export const authLimiter = withRateLimit({
  windowMs: parseDuration("5m"),
  max: 5,
  handler: (req, res, next) =>
    next(
      rateLimitError("Too many login attempts. Please try again in 5 minutes.")
    ),
  standardHeaders: true,
  legacyHeaders: false,
});