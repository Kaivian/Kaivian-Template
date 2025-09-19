import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env.js";
import * as UserAccountService from "../../services/userAccountService.js";
import * as RefreshTokenService from "../../services/auth/refreshTokenService.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/auth/jwt.js";
import { parseDuration } from "../../utils/parseDuration.js";
import AppError from "../../utils/errors/appError.js";
import crypto from "crypto";

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
 * Hash a token string using SHA-256.
 *
 * @param {string} token - Raw token
 * @returns {string} SHA-256 hash
 */
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/**
 * Authenticate a user and issue JWT access and refresh tokens.
 *
 * - Validates credentials.
 * - Ensures only one active refresh token per user.
 * - Sets HTTP-only cookies for tokens.
 *
 * @async
 * @function login
 * @param {import("express").Request} req - Express request, expects `username` and `password` in body.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Next middleware function.
 * @returns {Promise<void>} JSON response with success message.
 * @throws {AppError} 401 if credentials are invalid.
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await UserAccountService.validateUser(username, password);
    if (!user) throw new AppError("Invalid credentials", 401);

    // Check for existing active refresh token
    let tokenDoc = await RefreshTokenService.findActiveTokenByUser(user._id.toString());
    const sessionId = tokenDoc ? tokenDoc.session_id : uuidv4();

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      sessionId,
      roles: user.roles || [],
      permissions: user.permissions || {},
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      sessionId,
    });

    const deviceInfo = {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
      os: req.headers["sec-ch-ua-platform"] || "unknown",
    };

    if (tokenDoc) {
      // Update existing token
      await RefreshTokenService.updateToken(tokenDoc._id, {
        refresh_token_hash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_COOKIE_OPTIONS.maxAge),
        device: deviceInfo,
        status: "active",
        revokedAt: null,
        revokedByIp: null,
        lastUsedAt: null,
      });
    } else {
      // Create new token
      await RefreshTokenService.createToken({
        userId: user._id.toString(),
        sessionId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_COOKIE_OPTIONS.maxAge),
        device: deviceInfo,
      });
    }

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.json({ message: "Login successful" });
  } catch (err) {
    next(err);
  }
};

/**
 * Refresh an access token using a valid refresh token.
 *
 * - Reads refresh token from cookies.
 * - Verifies token signature and DB validity.
 * - Issues new access token.
 *
 * @async
 * @function refreshToken
 * @param {import("express").Request} req - Express request object with `refreshToken` cookie.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Next middleware function.
 * @returns {Promise<void>} JSON response with success message.
 * @throws {AppError} 401 if refresh token is missing, invalid, or revoked.
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError("No refresh token provided", 401);

    const payload = verifyRefreshToken(token);
    const storedToken = await RefreshTokenService.findToken(token, payload.sub);
    if (!storedToken) throw new AppError("Invalid or revoked refresh token", 401);

    const user = await UserAccountService.findById(payload.sub);
    if (!user) throw new AppError("User not found", 401);

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      sessionId: payload.session_id,
      roles: user.roles || [],
      permissions: user.permissions || {},
    });

    // Update last used timestamp
    await RefreshTokenService.updateLastUsed(storedToken._id.toString());

    res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);
    return res.json({ message: "Access token refreshed" });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout a user by revoking refresh token and clearing cookies.
 *
 * - Marks refresh token as revoked in DB.
 * - Clears access and refresh token cookies.
 *
 * @async
 * @function logout
 * @param {import("express").Request} req - Express request object (may contain `refreshToken` cookie).
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Next middleware function.
 * @returns {Promise<void>} JSON response with success message.
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await RefreshTokenService.revokeToken(token, req.ip);

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/auth/refresh" });

    return res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};