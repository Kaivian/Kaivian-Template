// server/src/controllers/auth/authController.js
import { env } from "../../config/env.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/auth/jwt.js";
import { parseDuration } from "../../utils/parseDuration.js";
import * as UserAccountService from "../../services/userAccountService.js";
import * as RefreshTokenService from "../../services/auth/refreshTokenService.js";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: parseDuration(env.JWT_EXPIRES_IN),
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/auth/refresh",
  maxAge: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
};

/**
 * Authenticate user and issue JWT tokens (access + refresh).
 *
 * - Validates username & password via {@link UserAccountService.validateUser}.
 * - Revokes old refresh tokens and issues a new one.
 * - Sets both `accessToken` and `refreshToken` cookies.
 *
 * @async
 * @function login
 * @param {import("express").Request} req - Express request object with `username` and `password` in body.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} Responds with `{ message: string }` and sets cookies, or error JSON.
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserAccountService.validateUser(username, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    await RefreshTokenService.createToken({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_COOKIE_OPTIONS.maxAge),
      createdByIp: req.ip,
    });

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Refresh an expired access token using a valid refresh token.
 *
 * - Reads `refreshToken` from cookies.
 * - Verifies token validity and checks DB state.
 * - Issues a new access token if valid.
 *
 * @async
 * @function refreshToken
 * @param {import("express").Request} req - Express request with `refreshToken` cookie.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Responds with `{ message: string }` and sets new access cookie, or error JSON.
 */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const payload = verifyRefreshToken(token);
    const storedToken = await RefreshTokenService.findToken(
      token,
      payload.userId
    );

    if (!storedToken) {
      return res
        .status(401)
        .json({ message: "Invalid or revoked refresh token" });
    }

    const user = await UserAccountService.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);
    res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);

    return res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

/**
 * Logout user by revoking refresh token and clearing cookies.
 *
 * - Revokes the stored refresh token in DB.
 * - Clears `accessToken` and `refreshToken` cookies.
 *
 * @async
 * @function logout
 * @param {import("express").Request} req - Express request with optional `refreshToken` cookie.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>} Responds with `{ message: string }`.
 */
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await RefreshTokenService.revokeToken(token, req.ip);
    }

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/auth/refresh" });

    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};