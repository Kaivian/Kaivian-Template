// server/src/middleware/auth.js
import { verifyAccessToken } from "../utils/auth/jwt.js";
import { AppError } from "../utils/errors/appError.js";

/**
 * Express middleware to authenticate requests using JWT access tokens.
 *
 * - Retrieves the access token from either:
 *   - `req.cookies.accessToken`, or
 *   - `Authorization: Bearer <token>` header.
 * - Verifies the token using {@link verifyAccessToken}.
 * - Attaches the decoded payload to `req.user` if valid.
 * - Throws {@link AppError} with:
 *   - **401 Unauthorized** if no token is provided.
 *   - **403 Forbidden** if the token is invalid or expired.
 *
 * @async
 * @function authenticate
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Resolves with `next()` if authenticated, otherwise forwards an {@link AppError}.
 *
 * @example
 * // Protect a route with authentication
 * import { authenticate } from "./middleware/auth.js";
 *
 * router.get("/profile", authenticate, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new AppError("Access token required", 401);
    }

    req.user = await verifyAccessToken(token);
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    if (err instanceof AppError) {
      return next(err);
    }
    return next(new AppError("Invalid or expired token", 403));
  }
};