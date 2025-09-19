// server/src/utils/auth/jwt.js
import { env } from "../../config/env.js";
import jwt from "jsonwebtoken";
import AppError from "../errors/appError.js";

const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_ISSUER,
  JWT_AUDIENCE,
} = env;

/**
 * Generate a short-lived access token for authentication.
 *
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.sessionId - Session ID tied to this login
 * @param {string[]} [params.roles=[]] - User roles
 * @param {Object} [params.permissions={}] - Fine-grained permissions
 * @returns {string} Signed JWT access token
 * @throws {AppError} If required params are missing
 */
export const generateAccessToken = ({
  userId,
  sessionId,
  roles = [],
  permissions = {},
}) => {
  if (!userId || !sessionId) {
    throw new AppError("userId and sessionId are required to generate access token.", 500);
  }

  const payload = {
    sub: String(userId),
    session_id: String(sessionId),
    roles,
    permissions,
  };

  return signToken(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

/**
 * Generate a long-lived refresh token for renewing access tokens.
 *
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.sessionId - Session ID tied to this login
 * @returns {string} Signed JWT refresh token
 * @throws {AppError} If required params are missing
 */
export const generateRefreshToken = ({ userId, sessionId }) => {
  if (!userId || !sessionId) {
    throw new AppError("userId and sessionId are required to generate refresh token.", 500);
  }

  const payload = {
    sub: String(userId),
    session_id: String(sessionId),
    type: "refresh",
  };

  return signToken(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: JWT_ISSUER,
  });
};

/**
 * Verify and decode an access token.
 *
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 * @throws {AppError} If token is invalid or expired
 */
export const verifyAccessToken = (token) =>
  verifyToken(token, JWT_SECRET, "access");

/**
 * Verify and decode a refresh token.
 *
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {AppError} If token is invalid or expired
 */
export const verifyRefreshToken = (token) =>
  verifyToken(token, JWT_REFRESH_SECRET, "refresh");

/**
 * Helper: Sign a JWT.
 *
 * @private
 * @param {Object} payload - Data to embed in the token
 * @param {string} secret - JWT secret key
 * @param {Object} options - jwt.sign options
 * @returns {string} Signed JWT
 * @throws {AppError} If secret or expiresIn is missing
 */
const signToken = (payload, secret, options) => {
  if (!secret) {
    throw new AppError("Missing JWT secret in environment variables.", 500);
  }
  if (!options?.expiresIn) {
    throw new AppError("Missing expiresIn option for JWT.", 500);
  }

  try {
    return jwt.sign(payload, secret, options);
  } catch (err) {
    throw new AppError(`Failed to sign token: ${err.message}`, 500);
  }
};

/**
 * Helper: Verify and decode a JWT.
 *
 * @private
 * @param {string} token - The JWT string to verify
 * @param {string} secret - JWT secret key
 * @param {"access"|"refresh"} type - Token type
 * @returns {Object} Decoded payload if valid
 * @throws {AppError} If token is invalid or expired
 */
const verifyToken = (token, secret, type) => {
  if (!secret) {
    throw new AppError(
      `Missing JWT ${type} secret in environment variables.`,
      500
    );
  }
  if (!token) {
    throw new AppError(`${type} token is required.`, 401);
  }

  try {
    return jwt.verify(token, secret, {
      issuer: JWT_ISSUER,
      audience: type === "access" ? JWT_AUDIENCE : undefined,
    });
  } catch (err) {
    throw new AppError(
      `Invalid or expired ${type} token: ${err.message}`,
      403
    );
  }
};