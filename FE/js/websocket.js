class WebSocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.onActionReceived = null;
    this.onStatusChange = null;
  }

  connect(url = "ws://localhost:3001") {
    try {
      console.log("🔌 Attempting to connect to:", url);

      // Try Socket.IO first
      if (typeof io !== "undefined") {
        this.connectSocketIO(url);
      } else {
        // Fallback to WebSocket
        this.connectWebSocket(url);
      }
    } catch (error) {
      console.error("❌ Connection error:", error);
      this.handleConnectionError();
    }
  }

  connectSocketIO(url) {
    this.socket = io(url, {
      transports: ["websocket", "polling"],
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.updateStatus("connected");
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Socket.IO disconnected");
      this.isConnected = false;
      this.updateStatus("disconnected");
      this.attemptReconnect();
    });

    this.socket.on("action", (data) => {
      console.log("🎯 Received action via Socket.IO:", data);
      this.handleActionReceived(data);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error);
      this.handleConnectionError();
    });
  }

  connectWebSocket(url) {
    // Convert HTTP URL to WebSocket URL if needed
    const wsUrl = url.replace(/^http/, "ws");

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("✅ WebSocket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.updateStatus("connected");
    };

    this.socket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      this.isConnected = false;
      this.updateStatus("disconnected");
      this.attemptReconnect();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🎯 Received action via WebSocket:", data);
        this.handleActionReceived(data);
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    this.socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      this.handleConnectionError();
    };
  }

  handleActionReceived(data) {
    if (this.onActionReceived) {
      this.onActionReceived(data);
    }
  }

  handleConnectionError() {
    this.isConnected = false;
    this.updateStatus("error");
    this.attemptReconnect();
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Max reconnection attempts reached");
      this.updateStatus("failed");
      return;
    }

    this.reconnectAttempts++;
    this.updateStatus("reconnecting");

    console.log(
      `🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);

    // Increase delay for next attempt
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
  }

  updateStatus(status) {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  disconnect() {
    if (this.socket) {
      if (typeof this.socket.disconnect === "function") {
        // Socket.IO
        this.socket.disconnect();
      } else {
        // WebSocket
        this.socket.close();
      }
      this.socket = null;
    }
    this.isConnected = false;
    this.updateStatus("disconnected");
  }

  sendMessage(message) {
    if (!this.isConnected || !this.socket) {
      console.warn("⚠️ Cannot send message: not connected");
      return false;
    }

    try {
      if (typeof this.socket.emit === "function") {
        // Socket.IO
        this.socket.emit("message", message);
      } else {
        // WebSocket
        this.socket.send(JSON.stringify(message));
      }
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    }
  }

  sendTextInput(text) {
    if (this.socket && this.isConnected) {
      try {
        if (this.socket.emit) {
          // Socket.IO
          this.socket.emit("text-input", { text: text });
        } else {
          // WebSocket
          this.socket.send(
            JSON.stringify({ type: "text-input", data: { text: text } })
          );
        }
        console.log("💬 Text input sent:", text);
      } catch (error) {
        console.error("❌ Error sending text input:", error);
      }
    } else {
      console.warn("⚠️ Cannot send text input: not connected");
    }
  }

  // Event handlers
  onAction(callback) {
    this.onActionReceived = callback;
  }

  onStatus(callback) {
    this.onStatusChange = callback;
  }
}

// Mock data generator for testing when no backend connection
class MockDataGenerator {
  constructor() {
    this.actions = [
      { actions: ["nhảy múa"] },
      { actions: ["vẫy tay"] },
      { actions: ["cúi chào"] },
      { actions: ["quay tròn"] },
      { actions: ["nhảy lên"] },
      { actions: ["nhảy múa", "vẫy tay"] },
      { actions: ["cúi chào", "quay tròn"] },
    ];
    this.isRunning = false;
    this.interval = null;
  }

  start(callback, intervalMs = 5000) {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("🎭 Starting mock data generator...");

    this.interval = setInterval(() => {
      const randomAction =
        this.actions[Math.floor(Math.random() * this.actions.length)];
      console.log("🎲 Generated mock action:", randomAction);
      callback(randomAction);
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log("⏹️ Mock data generator stopped");
  }
}
