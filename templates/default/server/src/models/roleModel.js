// server/src/model/roleModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Role Schema
 *
 * This schema defines a user role in the system.
 * Each role contains a unique key, a name, an optional description,
 * and a set of permissions grouped by module/resource.
 *
 * @typedef {Object} Role
 * @property {string} key - Unique identifier for the role (e.g., "admin", "user").
 * @property {string} name - Human-readable role name.
 * @property {string} [description] - Optional description of the role.
 * @property {Map<string, string[]>} permissions - Permissions grouped by module,
 * e.g. { user: ["create", "read"], post: ["read"] }.
 * @property {mongoose.ObjectId} createdBy - Reference to the User who created the role.
 * @property {mongoose.ObjectId|null} updatedBy - Reference to the User who last updated the role.
 * @property {Date} createdAt - Timestamp when the role was created (auto-generated).
 * @property {Date} updatedAt - Timestamp when the role was last updated (auto-generated).
 */
const RoleSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    permissions: {
      type: Map,
      of: [String],
      default: {},
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

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
