// server/src/utils/auth/jwt.js
import { env } from "../../config/env.js";
import jwt from "jsonwebtoken";

const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} = env;

/**
 * Generate a short-lived access token for authentication.
 * @param {Object} user - User object from a database.
 * @param {string} user._id - Unique ID of the user.
 * @param {Array<string>} user.roles - List of user roles.
 * @returns {string} Signed JWT access token.
 */
export const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    roles: user.roles || [],
  };
  return signToken(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate a long-lived refresh token for renewing access tokens.
 * @param {Object} user - User object from a database.
 * @param {string} user._id - Unique ID of the user.
 * @returns {string} Signed JWT refresh token.
 */
export const generateRefreshToken = (user) => {
  const payload = { userId: user._id };
  return signToken(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify and decode an access token.
 * @param {string} token - JWT access token.
 * @returns {Object} Decoded token payload if valid.
 */
export const verifyAccessToken = (token) => verifyToken(token, JWT_SECRET);

/**
 * Verify and decode a refresh token.
 * @param {string} token - JWT refresh token.
 * @returns {Object} Decoded token payload if valid.
 */
export const verifyRefreshToken = (token) => verifyToken(token, JWT_REFRESH_SECRET);

/**
 * Helper: Sign a JWT with given payload, secret, and options.
 * @param {Object} payload - Data to embed in the token.
 * @param {string} secret - JWT secret key.
 * @param {Object} options - JWT sign options (expiresIn, issuer, audience...).
 * @returns {string} Signed JWT.
 */
const signToken = (payload, secret, options) => {
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables.");
  }
  return jwt.sign(payload, secret, options);
};

/**
 * Helper: Verify and decode a JWT.
 * @param {string} token - The JWT string to verify.
 * @param {string} secret - JWT secret key.
 * @returns {Object} Decoded payload if valid.
 * @throws {Error} If token is invalid or expired.
 */
const verifyToken = (token, secret) => {
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables.");
  }
  return jwt.verify(token, secret);
};
