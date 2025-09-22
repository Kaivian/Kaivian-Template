// server/src/middleware/auth.js
import { verifyAccessToken } from "../utils/auth/jwt.js";
import { getUserTokenVersion } from "../services/auth/sessionService.js";
import { lwarn } from "../utils/logger.js";
import AppError from "../utils/errors/appError.js";

/**
 * Express middleware to authenticate incoming requests using JWT access tokens.
 *
 * Workflow:
 * 1. Extracts the access token from either:
 *    - Cookie `accessToken`, or
 *    - `Authorization: Bearer <token>` header.
 * 2. Verifies the token's signature and validity.
 * 3. Ensures the token type is "access".
 * 4. Compares the token's `tokenVersion` with the user's current version
 *    stored in Redis/DB. If they differ, the token is considered revoked.
 * 5. Attaches the verified user information to `req.user` for downstream handlers.
 *
 * Error Handling:
 * - If no token is provided → responds with **401 Unauthorized**.
 * - If the token is invalid, expired, or revoked → responds with **403 Forbidden**.
 *
 * Example usage:
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
 * or forwards an {@link AppError} if authentication fails.
 */
export const authenticate = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return next(new AppError("Access token required", 401));
  }

  try {
    // 1. Verify token
    const decoded = verifyAccessToken(token);

    // 2. Check token type
    if (decoded.type !== "access") {
      return next(new AppError("Invalid token type", 403));
    }

    // 3. Check token version
    const currentVersion = await getUserTokenVersion(decoded.sub);
    if (currentVersion === null || decoded.tokenVersion !== currentVersion) {
      return next(new AppError("Token has been revoked", 403));
    }

    // 4. Attach user info to request
    req.user = {
      id: decoded.sub,
      sessionId: decoded.session_id,
      tokenVersion: decoded.tokenVersion,
    };

    return next();
  } catch (err) {
    lwarn("JWT verification failed:", err.message);
    return next(new AppError("Invalid or expired token", 403));
  }
};