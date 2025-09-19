// server/src/models/refreshTokenModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * RefreshToken Schema
 *
 * Stores refresh tokens per login session.
 * Enables session management, security auditing, and device tracking.
 *
 * @typedef {Object} RefreshToken
 * @property {mongoose.ObjectId} user_id - Reference to the UserAccount (session owner).
 * @property {string} session_id - Unique identifier for the session (UUID or ObjectId).
 * @property {string} refresh_token_hash - SHA-256 hash of the refresh token (never store raw tokens).
 * @property {Object} device - Information about the client device.
 * @property {string} device.ip - IP address of the device.
 * @property {string|null} device.userAgent - Browser or application user-agent string.
 * @property {string|null} device.os - Operating system of the device.
 * @property {string} status - Session status (active | revoked | expired).
 * @property {Date} createdAt - Session creation timestamp.
 * @property {Date} expiresAt - Session expiration timestamp.
 * @property {Date|null} revokedAt - Timestamp when the session was revoked (if any).
 * @property {string|null} revokedByIp - IP address from which the session was revoked.
 * @property {Date|null} lastUsedAt - Last time the refresh token was used to obtain a new access token.
 */
const RefreshTokenSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "UserAccount",
      required: true,
    },
    session_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    refresh_token_hash: {
      type: String,
      required: true,
      unique: true,
    },
    device: {
      ip: { type: String, required: true },
      userAgent: { type: String, default: null },
      os: { type: String, default: null },
    },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
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
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

/**
 * Ensure a user can have at most 1 active refresh token at a time.
 * This compound partial index applies only to documents with status 'active'.
 */
RefreshTokenSchema.index(
  { user_id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);