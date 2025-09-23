// server/src/services/auth/sessionService.js
import UserAccount from "../../models/userAccountModel.js";

/**
 * Get the current token version of a user.
 *
 * This function ensures that access tokens are only valid if their `tokenVersion`
 * matches the user's current version. When a user's roles are updated, their password
 * is reset, or all sessions are revoked, the `tokenVersion` is incremented. This causes
 * all previously issued tokens to become invalid.
 *
 * Workflow:
 * 1. Fetch the user's tokenVersion directly from MongoDB.
 *
 * @async
 * @function getUserTokenVersion
 * @param {string} userId - The unique identifier of the user (MongoDB ObjectId as string).
 * @returns {Promise<number|null>} The user's current token version,
 * or `null` if the user does not exist.
 *
 * @example
 * const version = await getUserTokenVersion("64f1e6b8a2c1d2e9f9a12345");
 * if (decoded.tokenVersion !== version) {
 *   throw new AppError("Token has been revoked", 403);
 * }
 */
export const getUserTokenVersion = async (userId) => {
  const user = await UserAccount.findById(userId).select("tokenVersion");
  if (!user) {
    return null;
  }
  return user.tokenVersion || 0;
};