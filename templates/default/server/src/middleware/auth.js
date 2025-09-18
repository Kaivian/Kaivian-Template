// server/src/middleware/auth.js
import { verifyAccessToken } from "../utils/auth/jwt.js";

/**
 * Express middleware to authenticate requests using JWT access tokens.
 *
 * - Looks for the token in `req.cookies.accessToken` or the `Authorization` header.
 * - Verifies the token using {@link verifyAccessToken}.
 * - Attaches the decoded payload to `req.user` if valid.
 * - Returns `401 Unauthorized` if no token is provided.
 * - Returns `403 Forbidden` if the token is invalid or expired.
 *
 * @async
 * @function authenticate
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Sends a JSON error response or calls `next()` if valid.
 *
 * @example
 * // Protect a route
 * import { authenticate } from "./middleware/auth.js";
 * router.get("/profile", authenticate, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
export const authenticate = async (req, res, next) => {
  try {
    // Check cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    // Verify and attach user payload
    req.user = await verifyAccessToken(token);
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};