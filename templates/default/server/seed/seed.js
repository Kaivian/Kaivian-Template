// server/seed/seed.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { env } from "../src/config/env.js";
import UserAccount from "../src/models/userAccountModel.js";
import Role from "../src/models/roleModel.js";

// đọc file JSON
const configPath = path.resolve("./server/seed/seedConfig.json");
const rawConfig = fs.readFileSync(configPath, "utf-8");
const { roles: rolesConfig, users: usersConfig } = JSON.parse(rawConfig);

const MONGO_URI = env.MONGO_URI;
const DB_NAME = env.DB_NAME;

async function seed() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // 1️⃣ Seed roles first
    const roleMap = {};
    for (const r of rolesConfig) {
      let role = await Role.findOne({ key: r.key });
      if (!role) {
        role = await Role.create({ ...r, createdBy: null, updatedBy: null });
        console.log(`✅ Created role: ${r.key}`);
      } else {
        console.log(`⚠️ Role already exists: ${r.key}`);
      }
      roleMap[r.key] = role._id;
    }

    // 2️⃣ Seed users with role ObjectId
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
        console.log(`✅ Created user: ${u.username}`);
      } else {
        user.roles = userRoles;
        user.passwordHash = hashedPassword;
        user.isActive = u.isActive ?? user.isActive;
        user.updatedBy = null;
        await user.save();
        console.log(`🔄 Updated user: ${u.username}`);
      }
    }

    await mongoose.disconnect();
    console.log("🎉 Seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

seed();
