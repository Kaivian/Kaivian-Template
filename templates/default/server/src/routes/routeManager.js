// server/src/routes/routeManager.js
import { Router } from "express";
import authRoutes from "./auth/auth.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * Authentication routes
 * @route /auth
 * @group Auth
 * @description All authentication-related routes (login, register, refresh, logout, etc.)
 */
router.use("/auth", authRoutes);

/**
 * Root route
 * @route GET /
 * @group Root
 * @returns {object} 200 - Welcome message, API status, version, and timestamp
 * @example response - 200 - success
 * {
 *   "message": "Welcome to Icicle API",
 *   "status": "OK",
 *   "version": "1.0.0",
 *   "timestamp": "2025-09-18T10:00:00.000Z"
 * }
 */
router.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Icicle API",
        status: "OK",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});

/**
 * Health check route
 * @route GET /health
 * @group Health
 * @returns {object} 200 - Server health, uptime, and timestamp
 * @example response - 200 - success
 * {
 *   "status": "UP",
 *   "uptime": 123.456,
 *   "timestamp": "2025-09-18T10:01:00.000Z"
 * }
 */
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

/**
 * Protected test route (only available in non-production environments)
 * @route GET /protect
 * @group Test
 * @security JWT
 * @returns {object} 200 - Protected data and authenticated user info
 * @returns {Error} 401 - Unauthorized if JWT is invalid or missing
 * @example response - 200 - success
 * {
 *   "message": "This is protected data (dev only)",
 *   "user": { "id": "123", "username": "demoUser" }
 * }
 */
if (process.env.NODE_ENV !== "production") {
    router.get("/protect", authenticate, (req, res) => {
        res.json({
            message: "This is protected data (dev only)",
            user: req.user,
        });
    });
}

export default router;