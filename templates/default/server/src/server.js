import serverInstance, { app } from "./app.js";
import { env } from "./config/env.js";
import { log } from "./utils/logger.js";
import { connectOnce, disconnect } from "./config/mongo.js";

// Start server unless running tests
if (env.NODE_ENV !== "test") {
  (async () => {
    try {
      await connectOnce();
      serverInstance.start();
      log(`Environment: ${env.NODE_ENV}`);
    } catch (err) {
      log("❌ Failed to start server:", err.message);
      process.exit(1);
    }
  })();
}

// Graceful shutdown
async function shutdown() {
  log("Shutting down server...");
  try {
    await disconnect();
    await serverInstance.shutdown();
    process.exit(0);
  } catch (err) {
    log("❌ Error during shutdown:", err.message);
    process.exit(1);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
