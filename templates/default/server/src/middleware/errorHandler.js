// server/src/middleware/errorHandler.js
import AppError from "../utils/errors/appError.js";
import { lerror as logError } from "../utils/logger.js";

/**
 * Global error-handling middleware for Express applications.
 *
 * - Differentiates between operational errors (instances of {@link AppError})
 *   and programming/unknown errors.
 * - In development mode, includes stack traces for easier debugging.
 * - In production mode, hides stack traces and only logs essentials.
 *
 * @function errorHandler
 * @param {Error} err - The error object (can be {@link AppError} or an unknown error).
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {void} Sends a standardized JSON error response.
 *
 * @example
 * // In app.js
 * import { errorHandler } from "./middleware/errorHandler.js";
 * app.use(errorHandler);
 */
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // If it's not AppError, treat it as an unknown error
  if (!(err instanceof AppError)) {
    statusCode = 500;
    message = "Something went wrong";
  }

  // Log differently depending on environment
  if (process.env.NODE_ENV === "development") {
    logError("❌ Error caught by middleware:", err.stack);
  } else {
    logError(`❌ Error: ${message} (status ${statusCode})`);
  }

  // Standardized JSON response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}