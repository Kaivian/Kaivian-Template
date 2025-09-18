// server/src/repositories/auth/refreshTokenRepository.js
import RefreshToken from "../../models/auth/refreshTokenModel.js";

/**
 * Create a new refresh token document.
 *
 * @async
 * @function create
 * @param {Object} data - Token data
 * @param {string} data.user - User ID reference
 * @param {string} data.token - Refresh token string
 * @param {Date} data.expiresAt - Expiration date
 * @param {string|null} [data.createdByIp] - IP address of the creator
 * @returns {Promise<Object>} Created token document
 */
export const create = (data) => {
  return RefreshToken.create(data);
};

/**
 * Find one token by query.
 *
 * @async
 * @function findOne
 * @param {Object} query - Mongoose query object
 * @returns {Promise<Object|null>} Token document if found, otherwise null
 */
export const findOne = (query) => {
  return RefreshToken.findOne(query);
};

/**
 * Find one token and update it.
 *
 * @async
 * @function findOneAndUpdate
 * @param {Object} query - Mongoose filter query
 * @param {Object} update - Update operations
 * @param {Object} [options={ new: true }] - Mongoose update options
 * @returns {Promise<Object|null>} Updated token document if found, otherwise null
 */
export const findOneAndUpdate = (query, update, options = { new: true }) => {
  return RefreshToken.findOneAndUpdate(query, update, options);
};

/**
 * Update many tokens by query.
 *
 * @async
 * @function updateMany
 * @param {Object} query - Mongoose filter query
 * @param {Object} update - Update operations
 * @returns {Promise<Object>} Mongoose update result (contains matchedCount & modifiedCount)
 */
export const updateMany = (query, update) => {
  return RefreshToken.updateMany(query, update);
};

/**
 * Find all tokens by query.
 *
 * @async
 * @function findAll
 * @param {Object} query - Mongoose filter query
 * @returns {Promise<Object[]>} Array of token documents
 */
export const findAll = (query) => {
  return RefreshToken.find(query);
};

/**
 * Delete many tokens by query.
 *
 * @async
 * @function deleteMany
 * @param {Object} query - Mongoose filter query
 * @returns {Promise<Object>} Mongoose delete result (contains deletedCount)
 */
export const deleteMany = (query) => {
  return RefreshToken.deleteMany(query);
};