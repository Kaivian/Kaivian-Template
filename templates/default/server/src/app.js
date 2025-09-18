// server/src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { log } from "./utils/logger.js";
import routes from "./routes/routeManager.js";

export class AppServer {
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
    this.app.use(cookieParser());
    this.app.use(morgan("dev"));
  }

  _registerRoutes() {
    this.app.use("/", routes);
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

const instance = new AppServer();
export const app = instance.app;
export default instance;