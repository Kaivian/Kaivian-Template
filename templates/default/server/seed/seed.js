// server/seed/seed.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { env } from "../src/config/env.js";
import UserAccount from "../src/models/userAccountModel.js";
import Role from "../src/models/roleModel.js";

const configPath = path.resolve("./server/seed/seedConfig.json");
const rawConfig = fs.readFileSync(configPath, "utf-8");
const { roles: rolesConfig, users: usersConfig } = JSON.parse(rawConfig);

async function seed() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(env.MONGO_URI, { dbName: env.MONGO_DB_NAME });
    console.log("✅ Connected to MongoDB");

    // 1️⃣ Seed roles
    const roleMap = {};
    for (const r of rolesConfig) {
      let role = await Role.findOne({ key: r.key });
      if (!role) {
        role = await Role.create({ ...r, createdBy: null, updatedBy: null });
        console.log(`🆕 Created role: ${r.key}`);
      } else {
        console.log(`ℹ️ Role exists: ${r.key}`);
      }
      roleMap[r.key] = role._id;
    }

    // 2️⃣ Seed users
    for (const u of usersConfig) {
      let user = await UserAccount.findOne({ username: u.username });
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const userRoles = u.roleKeys.map((key) => roleMap[key]).filter(Boolean);

      if (!user) {
        await UserAccount.create({
          username: u.username,
          passwordHash: hashedPassword,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone || "",
          isActive: u.isActive ?? true,
          roles: userRoles,
          createdBy: null,
          updatedBy: null,
        });
        console.log(`🆕 Created user: ${u.username}`);
      } else {
        user.roles = userRoles;
        user.passwordHash = hashedPassword;
        user.isActive = u.isActive ?? user.isActive;
        user.updatedBy = null;
        await user.save();
        console.log(`🔄 Updated user: ${u.username}`);
      }
    }

    console.log("🎉 Seeding completed!");
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();