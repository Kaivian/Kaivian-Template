// server/src/middleware/auth.js
import {verifyAccessToken} from "../utils/auth/jwt.js";

/**
 * Middleware to authenticate JWT access tokens.
 * Attaches the decoded payload to `req.user` if the token is valid.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Access token required" });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Malformed authorization header" });
    }

    req.user = await verifyAccessToken(token);
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
