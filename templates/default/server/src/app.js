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

export class AppServer {
  constructor(options = {}) {
    this.port = options.port || env.PORT || 5000;
    this.app = express();
    this.server = null;

    this._registerMiddleware();
    this._registerRoutes();
    this._registerNotFound();
    this._registerErrorHandler();
  }

  _registerMiddleware() {
    this.app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(morgan("dev"));
    this.app.use("/api", apiLimiter);
  }

  _registerRoutes() {
    this.app.use("/", routes);
  }

  _registerNotFound() {
    this.app.use((req, res, next) => {
      next(new AppError(404, "Not Found", { path: req.path }));
    });
  }

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

  start() {
    if (this.server) return this.server;
    this.server = this.app.listen(this.port, () => {
      linfo(`✅ Server listening on http://localhost:${this.port}`);
    });
    return this.server;
  }

  async shutdown() {
    if (!this.server) return;
    await new Promise((resolve) => this.server.close(resolve));
    this.server = null;
    linfo("🛑 Server shut down gracefully");
  }
}

const instance = new AppServer();
export const app = instance.app;
export default instance;