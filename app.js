const WebSocketServer = require("./websocket-server");
const GPTService = require("./services/gpt-service");
const InputHandler = require("./handlers/input-handler");

class App {
  constructor() {
    // Initialize services
    this.gptService = new GPTService();
    this.socketServer = new WebSocketServer(3001);
    this.inputHandler = new InputHandler(this.gptService, this.socketServer);

    // Connect input handler to socket server
    this.socketServer.setInputHandler(this.inputHandler);

    console.log("🚀 App initialized successfully");
  }

  start() {
    try {
      // Start the WebSocket server
      this.socketServer.start();

      console.log("✅ Application started successfully!");
      console.log("🌐 Frontend: http://localhost:3001");
      console.log("📡 API Endpoints:");
      console.log("   POST /api/analyze-text - Analyze text input");
      console.log("   POST /api/action - Send actions directly");
      console.log("   GET /api/health - Health check");
      console.log("");
      console.log("🎯 Ready to process text inputs!");
    } catch (error) {
      console.error("❌ Failed to start application:", error);
      process.exit(1);
    }
  }

  stop() {
    console.log("🛑 Stopping application...");
    // Clear processing queue
    if (this.inputHandler) {
      this.inputHandler.clearQueue();
    }
    console.log("👋 Application stopped");
  }
}

// Create and start app if this file is run directly
if (require.main === module) {
  const app = new App();
  app.start();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Received SIGINT, shutting down gracefully...");
    app.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
    app.stop();
    process.exit(0);
  });
}

module.exports = App;
