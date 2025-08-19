class ApiClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.onActionReceived = null;
    this.onStatusChange = null;
  }

  async analyzeText(text) {
    try {
      console.log('📝 Analyzing text via API:', text);
      this.updateStatus('analyzing');

      const response = await fetch(`${this.baseUrl}/api/actions/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎯 Received action from API:', data);

      // Transform response to match expected format
      const actionData = {
        action: data.action,
        actions: data.actions,
        originalText: data.originalText,
        gptMessage: data.gptMessage,
        timestamp: new Date(data.timestamp),
        type: 'api-response',
        success: data.success,
      };

      this.updateStatus('completed');
      this.handleActionReceived(actionData);
      
      return actionData;
    } catch (error) {
      console.error('❌ API Error:', error);
      this.updateStatus('error');
      
      // Return error response in expected format
      const errorData = {
        action: 'idle',
        actions: ['idle'],
        originalText: text,
        gptMessage: 'Error occurred during analysis',
        timestamp: new Date(),
        type: 'error',
        success: false,
        error: error.message,
      };

      this.handleActionReceived(errorData);
      return errorData;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/actions/health`);
      const data = await response.json();
      console.log('❤️ Health check:', data);
      return data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  handleActionReceived(data) {
    if (this.onActionReceived) {
      this.onActionReceived(data);
    }
  }

  updateStatus(status) {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  // Event handlers
  onAction(callback) {
    this.onActionReceived = callback;
  }

  onStatus(callback) {
    this.onStatusChange = callback;
  }

  // Test method to send text input (compatible with existing frontend code)
  sendTextInput(text) {
    return this.analyzeText(text);
  }

  // Mock connection methods for compatibility
  connect() {
    console.log('🔌 API Client ready');
    this.updateStatus('connected');
    return Promise.resolve();
  }

  disconnect() {
    console.log('🔌 API Client disconnected');
    this.updateStatus('disconnected');
  }

  get isConnected() {
    return true; // API client is always "connected" if network is available
  }
}

// Mock data generator for testing (same as WebSocket version)
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
