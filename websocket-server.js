const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

class WebSocketServer {
  constructor(port = 3001) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.connectedClients = new Set();
    this.inputHandler = null; // Will be set by main app
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  setInputHandler(inputHandler) {
    this.inputHandler = inputHandler;
    console.log("🔗 Input handler connected to WebSocket server");
  }

  setupRoutes() {
    // Middleware
    this.app.use(express.json());

    // Serve static files from FE directory
    this.app.use(express.static(path.join(__dirname, "FE")));

    // API endpoint to send actions
    this.app.post("/api/action", (req, res) => {
      const { actions, text } = req.body;
      console.log("📡 Received action via API:", { actions, text });

      // Broadcast to all connected clients
      this.broadcastAction({ actions, text, timestamp: new Date() });

      res.json({
        success: true,
        message: "Action sent to clients",
        clientCount: this.connectedClients.size,
      });
    });

    // API endpoint to analyze text
    this.app.post("/api/analyze-text", (req, res) => {
      const { text } = req.body;
      console.log("📝 Received text analysis request:", text);

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Text is required",
        });
      }

      if (!this.inputHandler) {
        return res.status(500).json({
          success: false,
          error: "Input handler not initialized",
        });
      }

      // Process text input
      this.inputHandler
        .handleTextInput(text.trim())
        .then((result) => {
          res.json({
            success: result.success,
            message: result.message || "Text analysis requested",
            text: text.trim(),
            clientCount: this.connectedClients.size,
            queueLength: result.queueLength,
          });
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            error: error.message,
          });
        });
    });

    // Health check
    this.app.get("/api/health", (req, res) => {
      res.json({
        status: "ok",
        clients: this.connectedClients.size,
        timestamp: new Date(),
      });
    });

    // Root route serves the frontend
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "FE", "index.html"));
    });
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log("🔗 Client connected:", socket.id);
      this.connectedClients.add(socket.id);

      // Send welcome message
      socket.emit("action", {
        actions: ["vẫy tay"],
        text: "Chào mừng bạn đến với Princess Bot!",
        timestamp: new Date(),
      });

      socket.on("disconnect", () => {
        console.log("🔌 Client disconnected:", socket.id);
        this.connectedClients.delete(socket.id);
      });

      socket.on("message", (data) => {
        console.log("📨 Received message from client:", data);
      });

      socket.on("text-input", async (data) => {
        console.log("📝 Received text input from client:", data);

        if (this.inputHandler && data.text) {
          try {
            await this.inputHandler.handleTextInput(data.text, socket.id);
          } catch (error) {
            console.error("❌ Error processing text input:", error);
            socket.emit("error", {
              message: "Failed to process text input",
              error: error.message,
            });
          }
        } else {
          socket.emit("error", {
            message: "Input handler not available or invalid text",
          });
        }
      });

      socket.on("test-action", (data) => {
        console.log("🎭 Test action requested:", data);
        socket.emit("action", {
          actions: [data.action || "nhảy múa"],
          originalText: `Test action: ${data.action || "nhảy múa"}`,
          timestamp: new Date(),
          type: "test",
        });
      });
    });
  }

  broadcastAction(actionData) {
    console.log(
      `📢 Broadcasting action to ${this.connectedClients.size} clients:`,
      actionData
    );
    this.io.emit("action", actionData);
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 WebSocket server running on port ${this.port}`);
      console.log(`🌐 Frontend available at: http://localhost:${this.port}`);
      console.log(`📡 API endpoint: http://localhost:${this.port}/api/action`);
    });
  }

  // Method to be called from external scripts
  sendAction(actions, text = "") {
    this.broadcastAction({ actions, text, timestamp: new Date() });
  }

  // Method to get queue status
  getQueueStatus() {
    return this.inputHandler
      ? this.inputHandler.getQueueStatus()
      : { queueLength: 0, isProcessing: false };
  }
}

// Create and start server if this file is run directly
if (require.main === module) {
  const server = new WebSocketServer(3001);
  server.start();

  console.log("🎭 WebSocket server started in standalone mode");
  console.log("💡 To test full text processing, run: node app.js");
}

module.exports = WebSocketServer;
