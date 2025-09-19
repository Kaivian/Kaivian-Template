// server/src/services/auth/refreshTokenService.js
import * as RefreshTokenRepo from "../../repositories/auth/refreshTokenRepository.js";
import crypto from "crypto";

/**
 * Hash a refresh token using SHA-256.
 *
 * @param {string} token - Raw refresh token
 * @returns {string} SHA-256 hash of the token
 */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Create a new refresh token for a user session.
 * Revokes all previous active tokens for this user.
 *
 * @async
 * @param {Object} params
 * @param {string} params.userId - User ID (Mongo ObjectId)
 * @param {string} params.sessionId - Unique session ID (UUID)
 * @param {string} params.token - Raw refresh token
 * @param {Date} params.expiresAt - Expiration date
 * @param {Object} [params.device={}] - Device info: { ip, userAgent, os }
 * @returns {Promise<Object>} Newly created refresh token document
 */
export const createToken = async ({
  userId,
  sessionId,
  token,
  expiresAt,
  device = {},
}) => {
  // Revoke all existing active tokens for this user
  await RefreshTokenRepo.updateMany(
    { user_id: userId, status: "active" },
    { status: "revoked", revokedAt: new Date(), revokedByIp: device.ip || null }
  );

  // Create new refresh token
  return RefreshTokenRepo.create({
    user_id: userId,
    session_id: sessionId,
    refresh_token_hash: hashToken(token),
    device: {
      ip: device.ip || null,
      userAgent: device.userAgent || null,
      os: device.os || null,
    },
    status: "active",
    createdAt: new Date(),
    expiresAt,
    revokedAt: null,
    revokedByIp: null,
    lastUsedAt: null,
  });
};

/**
 * Find a valid refresh token by raw token string and user ID.
 *
 * @async
 * @param {string} token - Raw refresh token
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Refresh token document if valid
 */
export const findToken = async (token, userId) => {
  return RefreshTokenRepo.findOne({
    user_id: userId,
    refresh_token_hash: hashToken(token),
    status: "active",
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

/**
 * Revoke a single refresh token.
 *
 * @async
 * @param {string} token - Raw refresh token
 * @param {string|null} [revokedByIp=null] - IP address revoking the token
 * @returns {Promise<Object|null>} Updated refresh token document
 */
export const revokeToken = async (token, revokedByIp = null) => {
  return RefreshTokenRepo.findOneAndUpdate(
    { refresh_token_hash: hashToken(token), status: "active" },
    { status: "revoked", revokedAt: new Date(), revokedByIp },
    { new: true }
  );
};

/**
 * Update the lastUsedAt timestamp for a refresh token.
 *
 * @async
 * @param {string} token - Raw refresh token
 * @returns {Promise<Object|null>} Updated refresh token document
 */
export const updateLastUsed = async (token) => {
  return RefreshTokenRepo.findOneAndUpdate(
    { refresh_token_hash: hashToken(token), status: "active" },
    { lastUsedAt: new Date() },
    { new: true }
  );
};

/**
 * Find an active refresh token by user ID.
 * Returns the single active token if exists.
 *
 * @async
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Active refresh token document or null
 */
export const findActiveTokenByUser = async (userId) => {
  return RefreshTokenRepo.findOne({
    user_id: userId,
    status: "active",
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

/**
 * Update an existing refresh token document by ID.
 *
 * @async
 * @param {string} tokenId - Refresh token document ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object|null>} Updated refresh token document
 */
export const updateToken = async (tokenId, updateData) => {
  return RefreshTokenRepo.findOneAndUpdate(
    { _id: tokenId },
    updateData,
    { new: true }
  );
};