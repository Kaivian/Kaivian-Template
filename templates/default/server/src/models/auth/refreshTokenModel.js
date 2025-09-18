// server/src/model/refreshTokenModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * RefreshToken Schema
 *
 * This schema defines a refresh token issued to a user for renewing JWT access tokens.
 * It tracks token validity, expiration, revocation, and metadata about creation/updating.
 *
 * @typedef {Object} RefreshToken
 * @property {mongoose.ObjectId} user - Reference to the user who owns this token.
 * @property {string} token - The refresh token string.
 * @property {Date} expiresAt - Expiration date/time of the token.
 * @property {string} createdByIp - IP address from which the token was created.
 * @property {Date|null} [revokedAt] - Timestamp when the token was revoked, if any.
 * @property {string|null} [revokedByIp] - IP address from which the token was revoked.
 * @property {string|null} [replacedByToken] - Token that replaced this one (for rotation).
 * @property {Date} createdAt - Timestamp when the token was created (auto-generated).
 * @property {Date} updatedAt - Timestamp when the token was last updated (auto-generated).
 */
const RefreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "UserAccount",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdByIp: {
      type: String,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedByIp: {
      type: String,
      default: null,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);
