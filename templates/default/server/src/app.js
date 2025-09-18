import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { log } from "./utils/logger.js";
import authRoutes from "./routes/auth/auth.js";
import healthRoute from "./routes/health.js";
import { authenticate } from "./middleware/auth.js";

export class AppServer {
  /**
   * Create an AppServer instance
   * @param {Object} options
   * @param {number} [options.port] - Server port
   */
  constructor(options = {}) {
    this.port = options.port || env.PORT || 5000;
    this.app = express();
    this.server = null;

    this._registerMiddleware();
    this._registerRoutes();
    this._registerNotFound();
  }

  _registerMiddleware() {
    this.app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    this.app.use(express.json());
    this.app.use(morgan("dev"));
  }

  _registerRoutes() {
    this.app.get("/", (_req, res) => {
      res.json({ message: `${env.APP_NAME} API is running` });
    });

    this.app.use("/auth", authRoutes);
    this.app.use("/health", healthRoute);

    const api = express.Router();
    api.use(authenticate);

    this.app.use("/api", api);
  }

  _registerNotFound() {
    this.app.use((req, res) => {
      res.status(404).json({ error: "Not Found", path: req.path });
    });
  }

  /**
   * Start the server
   * @returns {import("http").Server}
   */
  start() {
    if (this.server) return this.server;
    this.server = this.app.listen(this.port, () => {
      log(`Server listening on http://localhost:${this.port}`);
    });
    return this.server;
  }

  /**
   * Shutdown the server
   */
  async shutdown() {
    if (!this.server) return;
    await new Promise((resolve) => this.server.close(resolve));
    this.server = null;
  }
}

const instance = new AppServer();
export const app = instance.app;
export default instance;
