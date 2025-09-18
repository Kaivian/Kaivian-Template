// server/src/services/userAccountService.js
import UserAccountModel from "../models/userAccountModel.js";
import bcrypt from "bcrypt";

/** @typedef {import("/server/src/models/userAccountModel.js").default} UserAccountDoc */

/**
 * Find a user account by username.
 * @param {string} username
 * @returns {Promise<UserAccountDoc|null>}
 */
export const findByUsername = async (username) => {
  return UserAccountModel.findOne({ username });
};

/**
 * Find a user account by ID.
 * @param {string} userId
 * @returns {Promise<UserAccountDoc|null>}
 */
export const findById = async (userId) => {
  return UserAccountModel.findById(userId);
};

/**
 * Create a new user account.
 * @param {object} userData
 * @returns {Promise<UserAccountDoc>}
 */
export const createUser = async (userData) => {
  return UserAccountModel.create(userData);
};

/**
 * Update a user account by ID.
 * @param {string} userId
 * @param {object} updateData
 * @returns {Promise<UserAccountDoc|null>}
 */
export const updateUser = async (userId, updateData) => {
  return UserAccountModel.findByIdAndUpdate(userId, updateData, { new: true });
};

/**
 * Delete a user account by ID.
 * @param {string} userId
 * @returns {Promise<UserAccountDoc|null>}
 */
export const deleteUser = async (userId) => {
  return UserAccountModel.findByIdAndDelete(userId);
};

/**
 * Validate username and password.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<UserAccountDoc|null>}
 */
export const validateUser = async (username, password) => {
  const user = await findByUsername(username);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid ? user : null;
};
