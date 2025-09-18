// server/src/services/auth/refreshTokenService.js
import RefreshToken from "/server/src/models/auth/refreshTokenModel.js";

/**
 * Create a new refresh token in DB.
 * @param {Object} data
 * @param {string} data.userId - User ID associated with token
 * @param {string} data.token - Refresh token string
 * @param {Date} data.expiresAt - Expiration date of the token
 * @returns {Promise<import("/server/src/models/auth/refreshTokenModel.js").default>}
 */
export const createToken = async ({ userId, token, expiresAt }) => {
  return RefreshToken.create({ userId, token, expiresAt });
};

/**
 * Find a valid (not revoked) refresh token by token string and user ID.
 * @param {string} token - The refresh token string
 * @param {string} userId - User ID
 * @returns {Promise<import("/server/src/models/auth/refreshTokenModel.js").default|null>}
 */
export const findToken = async (token, userId) => {
  return RefreshToken.findOne({ token, userId, revokedAt: null });
};

/**
 * Revoke a refresh token (set revokedAt to current date).
 * @param {string} token - The refresh token string to revoke
 * @returns {Promise<import("/server/src/models/auth/refreshTokenModel.js").default|null>}
 */
export const revokeToken = async (token) => {
  return RefreshToken.findOneAndUpdate(
    { token },
    { revokedAt: new Date() },
    { new: true }
  );
};

/**
 * Revoke all refresh tokens for a user (optional utility)
 * @param {string} userId
 * @returns {Promise<number>} - Number of tokens revoked
 */
export const revokeAllTokensForUser = async (userId) => {
  const result = await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
  return result.modifiedCount;
};

/**
 * Find all refresh tokens for a user (optional utility)
 * @param {string} userId
 * @returns {Promise<import("/server/src/models/auth/refreshTokenModel.js").default[]>}
 */
export const getTokensForUser = async (userId) => {
  return RefreshToken.find({ userId });
};
