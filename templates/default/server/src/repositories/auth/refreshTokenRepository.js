// server/src/repositories/auth/refreshTokenRepository.js
import RefreshToken from "../../models/auth/refreshTokenModel.js";

/**
 * Create a new refresh token document.
 *
 * @async
 * @param {Object} data - Refresh token data
 * @returns {Promise<Object>} Newly created refresh token document
 */
export const create = (data) => RefreshToken.create(data);

/**
 * Find a single refresh token document.
 *
 * @async
 * @param {Object} query - Mongoose query filter
 * @returns {Promise<Object|null>} Token document if found, otherwise `null`
 */
export const findOne = (query) => RefreshToken.findOne(query);

/**
 * Find a single refresh token document and update it.
 *
 * @async
 * @param {Object} query - Mongoose filter query
 * @param {Object} update - Update operations
 * @param {Object} [options={ new: true }] - Update options (returns updated document by default)
 * @returns {Promise<Object|null>} Updated token document if found, otherwise `null`
 */
export const findOneAndUpdate = (query, update, options = { new: true }) => RefreshToken.findOneAndUpdate(query, update, options);

/**
 * Update a single refresh token document.
 *
 * @async
 * @param {Object} query - Mongoose filter query
 * @param {Object} update - Update operations
 * @returns {Promise<{ acknowledged: boolean, matchedCount: number, modifiedCount: number }>}
 * Mongoose update result
 */
export const updateOne = (query, update) => RefreshToken.updateOne(query, update);

/**
 * Update multiple refresh token documents.
 *
 * @async
 * @param {Object} query - Mongoose filter query
 * @param {Object} update - Update operations
 * @returns {Promise<{ acknowledged: boolean, matchedCount: number, modifiedCount: number }>}
 * Mongoose update result
 */
export const updateMany = (query, update) => RefreshToken.updateMany(query, update);

/**
 * Find all refresh token documents matching a query.
 *
 * @async
 * @param {Object} query - Mongoose filter query
 * @returns {Promise<Object[]>} Array of token documents
 */
export const findAll = (query) => RefreshToken.find(query);

/**
 * Delete multiple refresh token documents.
 *
 * @async
 * @param {Object} query - Mongoose filter query
 * @returns {Promise<{ acknowledged: boolean, deletedCount: number }>}
 * Mongoose delete result
 */
export const deleteMany = (query) => RefreshToken.deleteMany(query);