// server/src/middleware/auth.js
import { verifyAccessToken } from "../utils/auth/jwt.js";
import AppError from "../utils/errors/appError.js";

/**
 * Express middleware to authenticate incoming requests using JWT access tokens.
 *
 * - Extracts the token from either:
 *   - Cookie `accessToken`, or
 *   - `Authorization: Bearer <token>` header.
 * - If no token is found → responds with **401 Unauthorized**.
 * - If the token is invalid or expired → responds with **403 Forbidden**.
 * - If valid, attaches the decoded payload to `req.user` and continues.
 *
 * ### Example
 * ```js
 * import { authenticate } from "./middleware/auth.js";
 *
 * router.get("/profile", authenticate, (req, res) => {
 *   res.json({ user: req.user });
 * });
 * ```
 *
 * @async
 * @function authenticate
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Calls `next()` if authentication succeeds,
 * or forwards an {@link AppError} to the error handler if it fails.
 */
export const authenticate = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return next(new AppError("Access token required", 401));
  }

  try {
    req.user = await verifyAccessToken(token);
    return next();
  } catch (err) {
    console.warn("JWT verification failed:", err.message);
    return next(new AppError("Invalid or expired token", 403));
  }
};