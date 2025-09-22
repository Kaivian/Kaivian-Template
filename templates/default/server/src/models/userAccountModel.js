// server/src/model/userAccountModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * UserAccount Schema
 *
 * This schema defines a user account in the system.
 * Each account contains login credentials, contact details,
 * assigned roles, and metadata about who created/updated the account.
 *
 * @typedef {Object} UserAccount
 * @property {string} username - Unique username for login.
 * @property {string} passwordHash - Securely hashed password string.
 * @property {string} [email] - Unique email address (optional, lowercase, trimmed).
 * @property {string} fullName - Full name of the user.
 * @property {string|null} [phone] - Optional phone number.
 * @property {boolean} isActive - Status flag to indicate if the account is active (default: true).
 * @property {mongoose.ObjectId[]} roles - References to Role documents assigned to the user.
 * @property {number} tokenVersion - Increments when revoking all tokens (default: 0).
 * @property {mongoose.ObjectId} createdBy - Reference to the User who created this account.
 * @property {mongoose.ObjectId|null} updatedBy - Reference to the User who last updated this account.
 * @property {Date} createdAt - Timestamp when the account was created (auto-generated).
 * @property {Date} updatedAt - Timestamp when the account was last updated (auto-generated).
 */
const UserAccountSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true, // allows multiple docs with null email
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    tokenVersion: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.UserAccount || mongoose.model("UserAccount", UserAccountSchema);
