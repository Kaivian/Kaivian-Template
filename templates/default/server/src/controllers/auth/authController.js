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
import AppError from "../../utils/errors/appError.js";

const ACCESS_COOKIE_OPTIONS_PATH = "/";
const REFRESH_COOKIE_OPTIONS_PATH = "/auth/refresh";
const { NODE_ENV, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } = env;

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  path: ACCESS_COOKIE_OPTIONS_PATH,
  maxAge: parseDuration(JWT_EXPIRES_IN),
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  path: REFRESH_COOKIE_OPTIONS_PATH,
  maxAge: parseDuration(JWT_REFRESH_EXPIRES_IN),
};

/**
 * Authenticate user and issue JWT tokens (access + refresh).
 *
 * Workflow:
 * - Validates username & password via {@link UserAccountService.validateUser}.
 * - Revokes old refresh tokens for the user.
 * - Creates a new refresh token in DB and sets it as an HTTP-only cookie.
 * - Issues a new access token and sets it as an HTTP-only cookie.
 *
 * Errors:
 * - 401 Unauthorized → Invalid credentials
 * - 500 Internal Server Error → Other unexpected issues
 *
 * @async
 * @function login
 * @param {import("express").Request} req - Express request object (expects `username`, `password` in body).
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Responds with JSON `{ message: string }` and sets cookies.
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await UserAccountService.validateUser(username, password);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
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
    next(err);
  }
};

/**
 * Refresh an expired access token using a valid refresh token.
 *
 * Workflow:
 * - Reads `refreshToken` from cookies.
 * - Verifies the refresh token signature and checks DB validity.
 * - If valid, issues a new access token and sets it as an HTTP-only cookie.
 *
 * Errors:
 * - 401 Unauthorized → Missing/invalid/expired refresh token
 * - 401 Unauthorized → User not found
 *
 * @async
 * @function refreshToken
 * @param {import("express").Request} req - Express request (expects `refreshToken` cookie).
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Responds with JSON `{ message: string }` and sets new access cookie.
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new AppError("No refresh token provided", 401);
    }

    const payload = verifyRefreshToken(token);
    const storedToken = await RefreshTokenService.findToken(
      token,
      payload.userId
    );

    if (!storedToken) {
      throw new AppError("Invalid or revoked refresh token", 401);
    }

    const user = await UserAccountService.findById(payload.userId);
    if (!user) {
      throw new AppError("User not found", 401);
    }

    const newAccessToken = generateAccessToken(user);
    res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);

    return res.json({ message: "Access token refreshed" });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout user by revoking refresh token and clearing cookies.
 *
 * Workflow:
 * - Revokes the stored refresh token in DB (if present).
 * - Clears both `accessToken` and `refreshToken` cookies.
 *
 * Errors:
 * - 500 Internal Server Error → Unexpected failures during logout
 *
 * @async
 * @function logout
 * @param {import("express").Request} req - Express request (may contain `refreshToken` cookie).
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Responds with JSON `{ message: string }`.
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await RefreshTokenService.revokeToken(token, req.ip);
    }

    res.clearCookie("accessToken", { path: ACCESS_COOKIE_OPTIONS_PATH });
    res.clearCookie("refreshToken", { path: REFRESH_COOKIE_OPTIONS_PATH });

    return res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};