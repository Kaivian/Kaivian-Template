// server/src/services/auth/refreshTokenService.js
import * as RefreshTokenRepo from "../../repositories/auth/refreshTokenRepository.js";

/**
 * Create a new refresh token in the database.
 *
 * - Deletes all previous refresh tokens for the user to ensure only one active token.
 * - Creates and persists a new refresh token.
 *
 * @async
 * @function createToken
 * @param {Object} params - Token creation parameters.
 * @param {string} params.userId - ID of the user.
 * @param {string} params.token - The refresh token string.
 * @param {Date} params.expiresAt - Expiration date of the token.
 * @param {string|null} [params.createdByIp] - IP address where the token was issued.
 * @returns {Promise<import("../../models/auth/refreshTokenModel.js").default>} The newly created refresh token document.
 */
export const createToken = async ({ userId, token, expiresAt, createdByIp }) => {
  await RefreshTokenRepo.deleteMany({ user: userId });
  
  return RefreshTokenRepo.create({
    user: userId,
    token,
    expiresAt,
    createdByIp,
  });
};

/**
 * Find a valid (not revoked) refresh token by token string and user ID.
 *
 * @async
 * @function findToken
 * @param {string} token - Refresh token string
 * @param {string} userId - ID of the user
 * @returns {Promise<Object|null>} The refresh token document if found, otherwise null
 */
export const findToken = async (token, userId) => {
  return RefreshTokenRepo.findOne({
    token,
    user: userId,
    revokedAt: null,
  });
};

/**
 * Revoke a refresh token.
 *
 * @async
 * @function revokeToken
 * @param {string} token - Refresh token string
 * @param {string|null} [revokedByIp=null] - IP address of the client revoking the token
 * @returns {Promise<Object|null>} Updated refresh token document if found, otherwise null
 */
export const revokeToken = async (token, revokedByIp = null) => {
  return RefreshTokenRepo.findOneAndUpdate(
    { token },
    { revokedAt: new Date(), revokedByIp },
    { new: true }
  );
};

/**
 * Revoke all refresh tokens for a user.
 *
 * @async
 * @function revokeAllTokensForUser
 * @param {string} userId - ID of the user
 * @param {string|null} [revokedByIp=null] - IP address of the client revoking the tokens
 * @returns {Promise<number>} Number of tokens revoked
 */
export const revokeAllTokensForUser = async (userId, revokedByIp = null) => {
  const result = await RefreshTokenRepo.updateMany(
    { user: userId, revokedAt: null },
    { revokedAt: new Date(), revokedByIp }
  );
  return result.modifiedCount;
};

/**
 * Get all refresh tokens for a user.
 *
 * @async
 * @function getTokensForUser
 * @param {string} userId - ID of the user
 * @returns {Promise<Object[]>} List of refresh token documents
 */
export const getTokensForUser = async (userId) => {
  return RefreshTokenRepo.findAll({ user: userId });
};