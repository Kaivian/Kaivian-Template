// server/src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";
import { parseDuration } from "../utils/parseDuration.js";
import AppError from "../utils/errors/appError.js";

/**
 * Creates a standardized error response for rate limiting.
 *
 * @param {string} message - Human-readable error message.
 * @returns {AppError} An AppError instance with status 429.
 */
const rateLimitError = (message) =>
  new AppError(message, 429, { type: "RateLimitError" });

/**
 * General API rate limiter.
 *
 * - Limits each IP to **100 requests per 15 minutes**.
 * - Suitable for most public API endpoints.
 *
 * @constant
 */
export const apiLimiter = rateLimit({
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
 * - Limits each IP to **5 requests per 5 minutes**.
 * - Helps mitigate brute-force attacks on login/register.
 *
 * @constant
 */
export const authLimiter = rateLimit({
  windowMs: parseDuration("5m"),
  max: 5,
  handler: (req, res, next) =>
    next(
      rateLimitError("Too many login attempts. Please try again in 5 minutes.")
    ),
  standardHeaders: true,
  legacyHeaders: false,
});