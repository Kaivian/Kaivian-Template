// server/src/index.js
import serverInstance, { app } from "./app.js";
import { env } from "./config/env.js";
import { linfo, lerror } from "./utils/logger.js";
import { connectOnce, disconnect } from "./config/mongo.js";

// Start server unless running tests
if (env.NODE_ENV !== "test") {
  (async () => {
    try {
      await connectOnce();
      serverInstance.start();
      linfo(`🌍 Environment: ${env.NODE_ENV}`);
    } catch (error) {
      lerror("❌ Failed to start server:", error.message);
      process.exit(1);
    }
  })();
}

// Graceful shutdown
async function shutdown() {
  linfo("🛑 Shutting down server...");
  try {
    await disconnect();
    await serverInstance.shutdown();
    process.exit(0);
  } catch (error) {
    lerror("❌ Error during shutdown:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;