// server/src/utils/errors/appError.js

/**
 * Custom application error class.
 * Ensures consistent error handling across the API.
 */
export default class AppError extends Error {
  /**
   * @param {string} message - Error message.
   * @param {number} statusCode - HTTP status code (default: 500).
   * @param {any} [details] - Optional additional error details.
   */
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Mark as an expected error

    // Maintain proper stack trace (V8 only)
    Error.captureStackTrace?.(this, this.constructor);
  }
}
