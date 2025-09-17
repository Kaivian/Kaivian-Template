import express from "express";
import cors from "cors";
import morgan from "morgan";
import healthRoute from "./routes/health.js";
import { env } from "./config/env.js";
import { log } from "./utils/logger.js";

// OOP-style server wrapper to keep things organized and testable
export class AppServer {
  constructor(options = {}) {
    this.port = options.port || env.PORT || 5000;
    this.app = express();
    this.server = null;

    this._registerMiddleware(options);
    this._registerRoutes(options);
    this._registerNotFound();
  }

  _registerMiddleware(_options) {
    this.app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    this.app.use(express.json());
    this.app.use(morgan("dev"));
  }

  _registerRoutes(_options) {
    // basic root routes
    this.app.get("/", (_req, res) => {
      res.json({ message: `${env.APP_NAME} API is running` });
    });

    // mount feature routes under /api
    const api = express.Router();
    api.use(healthRoute); // exposes GET /health

    this.app.use("/api", api);
  }

  _registerNotFound() {
    this.app.use((req, res) => {
      res.status(404).json({ error: "Not Found", path: req.path });
    });
  }

  start() {
    if (this.server) return this.server;
    this.server = this.app.listen(this.port, () => {
      log(`Server listening on http://localhost:${this.port}`);
    });
    return this.server;
  }

  async shutdown() {
    if (!this.server) return;
    await new Promise((resolve) => this.server.close(resolve));
    this.server = null;
  }
}

// Export a ready-to-use app (useful for testing)
const instance = new AppServer();
export const app = instance.app;
export default instance;
