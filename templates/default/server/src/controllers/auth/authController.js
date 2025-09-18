// server/src/controllers/auth/authController.js
import { env } from "/server/src/config/env.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "/server/src/utils/auth/jwt.js";
import { parseDuration } from "/server/src/utils/parseDuration.js";
import * as UserAccountService from "/server/src/services/userAccountService.js";
import * as RefreshTokenService from "/server/src/services/auth/refreshTokenService.js";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/auth/refresh",
  maxAge: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
};

/**
 * Authenticate user, issue access and refresh tokens.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate user credentials
    const user = await UserAccountService.validateUser(username, password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    await RefreshTokenService.createToken({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_COOKIE_OPTIONS.maxAge),
    });

    // Send cookie + response
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.json({ accessToken });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Refresh access token using a valid refresh token.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Verify refresh token
    const payload = verifyRefreshToken(token);

    // Check token in DB
    const storedToken = await RefreshTokenService.findToken(token, payload.userId);
    if (!storedToken) return res.status(401).json({ message: "Invalid or revoked token" });

    // Get user
    const user = await UserAccountService.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Issue a new access token
    const newAccessToken = generateAccessToken(user);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Revoke refresh token and clear authentication cookie.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await RefreshTokenService.revokeToken(token);

    res.clearCookie("refreshToken", { path: "/auth/refresh" });
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
