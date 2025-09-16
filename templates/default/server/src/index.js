import serverInstance, { app } from "./app.js";
import { env } from "./lib/env.js";
import { log } from "./lib/logger.js";

// Start server unless running tests
if (process.env.NODE_ENV !== "test") {
  serverInstance.start();
  log(`Environment: ${env.NODE_ENV}`);
}

// Graceful shutdown
async function shutdown() {
  log("Shutting down server...");
  await serverInstance.shutdown();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
