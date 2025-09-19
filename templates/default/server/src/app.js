// server/src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import AppError from "./utils/errors/appError.js";
import routes from "./routes/routeManager.js";
import { env } from "./config/env.js";
import { linfo, lwarn, lerror } from "./utils/logger.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

/**
 * Encapsulates the Express server configuration, middleware,
 * routes, and lifecycle management (start/shutdown).
 */
export class AppServer {
  /**
   * @param {Object} [options={}] - Optional server configuration.
   * @param {number} [options.port] - Port to run the server on.
   */
  constructor(options = {}) {
    /** @type {number} */
    this.port = options.port || env.PORT || 5000;

    /** @type {import("express").Express} */
    this.app = express();

    /** @type {import("http").Server | null} */
    this.server = null;

    this._registerMiddleware();
    this._registerRoutes();
    this._registerNotFound();
    this._registerErrorHandler();
  }

  /**
   * Register global middleware (CORS, JSON parsing, cookies, logging, rate limiting).
   * @private
   */
  _registerMiddleware() {
    this.app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(morgan("dev"));
    this.app.use("/api", apiLimiter);
  }

  /**
   * Register application routes.
   * @private
   */
  _registerRoutes() {
    this.app.use("/", routes);
  }

  /**
   * Handle unmatched routes with a 404 error.
   * @private
   */
  _registerNotFound() {
    this.app.use((req, res, next) => {
      next(new AppError("Not Found", 404, { path: req.path }));
    });
  }

  /**
   * Register global error handler.
   * Differentiates between AppError (operational errors) and unexpected errors.
   * @private
   */
  _registerErrorHandler() {
    this.app.use((err, req, res, next) => {
      if (err instanceof AppError) {
        lwarn(`[${req.method}] ${req.originalUrl} → ${err.statusCode} ${err.message}`);
        res.status(err.statusCode).json({
          success: false,
          error: {
            message: err.message,
            details: err.details || null,
          },
        });
      } else {
        lerror("❌ [server] Unexpected error:", err);
        res.status(500).json({
          success: false,
          error: { message: "Internal Server Error" },
        });
      }
    });
  }

  /**
   * Start the server.
   * @returns {import("http").Server} The running server instance.
   */
  start() {
    if (this.server) return this.server;
    this.server = this.app.listen(this.port, () => {
      linfo(`✅ Server listening on http://localhost:${this.port}`);
    });
    return this.server;
  }

  /**
   * Gracefully shut down the server.
   * @returns {Promise<void>}
   */
  async shutdown() {
    if (!this.server) return;
    await new Promise((resolve) => this.server.close(resolve));
    this.server = null;
    linfo("🛑 Server shut down gracefully");
  }
}

// Create singleton instance
const instance = new AppServer();
export const app = instance.app;
export default instance;