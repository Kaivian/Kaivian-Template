// server/src/middleware/errorHandler.js
import AppError from "../utils/errors/appError.js";
import { lerror } from "../utils/logger.js";

/**
 * Global error-handling middleware for Express applications.
 *
 * - Differentiates between operational errors (instances of {@link AppError})
 *   and unexpected/programming errors.
 * - Ensures `statusCode` is always numeric to prevent Express crashes.
 * - Logs errors differently based on environment:
 *   - **Development**: Logs error name + message (stack trace returned in JSON).
 *   - **Production**: Logs only essential error info.
 * - Returns a standardized JSON error response.
 *
 * @function errorHandler
 * @param {Error} err - The error object (can be {@link AppError} or any unknown error).
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {void} Sends a JSON error response with `success: false`.
 *
 * @example
 * // In app.js
 * import { errorHandler } from "./middleware/errorHandler.js";
 * app.use(errorHandler);
 */
export function errorHandler(err, req, res, next) {
  // Ensure statusCode is numeric
  let statusCode = Number(err.statusCode);
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
    statusCode = 500; // fallback for invalid codes
  }

  // Determine message
  const message = err.message || (statusCode === 500 ? "Internal Server Error" : "Error");

  // Log based on environment
  if (process.env.NODE_ENV === "development") {
    lerror(`❌ Error caught by middleware: ${err.name || "Error"}: ${message}`);
  } else if (statusCode >= 500) {
    // Only log server errors in production
    lerror(`❌ Error: ${message} (status ${statusCode})`);
  }

  // Send standardized JSON response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}