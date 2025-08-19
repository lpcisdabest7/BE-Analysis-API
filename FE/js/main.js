// Main application controller
class PrincessBot {
  constructor() {
    this.princess3d = null;
    this.animationManager = null;
    this.actionQueue = null;
    this.apiClient = null;
    this.mockGenerator = null;

    this.elements = {};
    this.actionHistory = [];
    this.maxHistoryItems = 10;

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('🚀 Initializing Princess Bot...');

    // Get DOM elements
    this.elements = {
      canvas: document.getElementById('three-canvas'),
      connectionStatus: document.getElementById('connection-status'),
      currentAction: document.getElementById('current-action'),
      actionList: document.getElementById('action-list'),
      connectBtn: document.getElementById('connect-btn'),
      testActionBtn: document.getElementById('test-action-btn'),
      textInput: document.getElementById('text-input'),
      sendTextBtn: document.getElementById('send-text-btn'),
      textStatus: document.getElementById('text-status'),
    };

    // Validate elements
    if (!this.elements.canvas) {
      console.error('❌ Canvas element not found!');
      return;
    }

    // Initialize 3D princess
    this.princess3d = new Princess3D(this.elements.canvas);

    // Initialize animation manager
    this.animationManager = new AnimationManager(this.princess3d);

    // Initialize action queue
    this.actionQueue = new ActionQueue(this.animationManager);

    // Initialize API client
    this.apiClient = new ApiClient('http://localhost:3000');
    this.setupApiClientHandlers();

    // Initialize mock data generator
    this.mockGenerator = new MockDataGenerator();

    // Setup event listeners
    this.setupEventListeners();

    // Update UI
    this.updateConnectionStatus('disconnected');
    this.updateCurrentAction('Chờ hành động...');

    console.log('✅ Princess Bot initialized successfully!');

    // Auto-connect attempt
    setTimeout(() => {
      this.connectToBackend();
    }, 1000);
  }

  setupApiClientHandlers() {
    this.apiClient.onAction((data) => {
      this.handleActionReceived(data);
    });

    this.apiClient.onStatus((status) => {
      this.updateConnectionStatus(status);
    });
  }

  setupEventListeners() {
    // Connect button
    if (this.elements.connectBtn) {
      this.elements.connectBtn.addEventListener('click', () => {
        this.connectToBackend();
      });
    }

    // Test action button
    if (this.elements.testActionBtn) {
      this.elements.testActionBtn.addEventListener('click', () => {
        this.testRandomAction();
      });
    }

    // Send text button
    if (this.elements.sendTextBtn) {
      this.elements.sendTextBtn.addEventListener('click', () => {
        this.sendTextInput();
      });
    }

    // Text input - Enter key
    if (this.elements.textInput) {
      this.elements.textInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          this.sendTextInput();
        }
      });
    }

    // Sample text buttons
    document.querySelectorAll('.sample-text-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        if (this.elements.textInput) {
          this.elements.textInput.value = text;
          this.sendTextInput();
        }
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyboard(event);
    });
  }

  connectToBackend() {
    console.log('🔌 Attempting to connect to backend...');
    this.updateConnectionStatus('connecting');

    // Try to connect to WebSocket server
    this.apiClient.connect();

    // If connection fails after 5 seconds, start mock data
    setTimeout(() => {
      if (!this.apiClient.isConnected) {
        console.log('⚠️ Backend connection failed, starting mock data...');
        this.startMockMode();
      }
    }, 5000);
  }

  startMockMode() {
    this.updateConnectionStatus('mock');
    this.mockGenerator.start((actionData) => {
      this.handleActionReceived(actionData);
    }, 7000); // Generate action every 7 seconds
  }

  handleActionReceived(data) {
    console.log('🎯 Processing received action:', data);

    let actions = [];

    if (data.actions && Array.isArray(data.actions)) {
      actions = data.actions;
    } else if (typeof data === 'string') {
      // Parse string as action text
      actions = this.animationManager.parseActions(data);
    } else if (data.action) {
      actions = [data.action];
    } else {
      console.warn('⚠️ Unknown action format:', data);
      return;
    }

    // Add to history
    this.addToHistory(actions);

    // Update current action display
    this.updateCurrentAction(actions.join(', '));

    // Execute actions
    this.animationManager.executeActions(actions);
  }

  addToHistory(actions) {
    const historyItem = {
      actions: actions,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9),
    };

    this.actionHistory.unshift(historyItem);

    // Keep only latest items
    if (this.actionHistory.length > this.maxHistoryItems) {
      this.actionHistory = this.actionHistory.slice(0, this.maxHistoryItems);
    }

    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    if (!this.elements.actionList) return;

    this.elements.actionList.innerHTML = '';

    this.actionHistory.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `
                <strong>${item.actions.join(', ')}</strong>
                <br>
                <span class="timestamp">${this.formatTime(
                  item.timestamp,
                )}</span>
            `;
      this.elements.actionList.appendChild(li);
    });
  }

  updateConnectionStatus(status) {
    if (!this.elements.connectionStatus) return;

    const statusMap = {
      connecting: { text: 'Đang kết nối...', class: 'connecting' },
      connected: { text: '✅ Đã kết nối', class: 'connected' },
      disconnected: { text: '❌ Chưa kết nối', class: 'disconnected' },
      reconnecting: { text: '🔄 Đang kết nối lại...', class: 'connecting' },
      error: { text: '⚠️ Lỗi kết nối', class: 'error' },
      failed: { text: '❌ Kết nối thất bại', class: 'error' },
      mock: { text: '🎭 Chế độ demo', class: 'mock' },
    };

    const statusInfo = statusMap[status] || statusMap['disconnected'];

    this.elements.connectionStatus.textContent = statusInfo.text;
    this.elements.connectionStatus.className = `connection-status ${statusInfo.class}`;

    // Update connect button
    if (this.elements.connectBtn) {
      this.elements.connectBtn.textContent =
        status === 'connected' ? 'Đã kết nối' : 'Kết nối';
      this.elements.connectBtn.disabled = status === 'connecting';
    }
  }

  updateCurrentAction(action) {
    if (!this.elements.currentAction) return;

    this.elements.currentAction.textContent = action;
    this.elements.currentAction.classList.add('active');

    // Remove active class after 3 seconds
    setTimeout(() => {
      this.elements.currentAction.classList.remove('active');
    }, 3000);
  }

  testRandomAction() {
    const testActions = [
      ['nhảy múa'],
      ['vẫy tay'],
      ['cúi chào'],
      ['quay tròn'],
      ['nhảy lên'],
      ['nhảy múa', 'vẫy tay'],
    ];

    const randomAction =
      testActions[Math.floor(Math.random() * testActions.length)];

    console.log('🎲 Testing random action:', randomAction);
    this.handleActionReceived({ actions: randomAction });
  }

  handleKeyboard(event) {
    // Keyboard shortcuts
    switch (event.key) {
      case '1':
        this.handleActionReceived({ actions: ['nhảy múa'] });
        break;
      case '2':
        this.handleActionReceived({ actions: ['vẫy tay'] });
        break;
      case '3':
        this.handleActionReceived({ actions: ['cúi chào'] });
        break;
      case '4':
        this.handleActionReceived({ actions: ['quay tròn'] });
        break;
      case '5':
        this.handleActionReceived({ actions: ['nhảy lên'] });
        break;
      case 't':
      case 'T':
        this.testRandomAction();
        break;
      case 'c':
      case 'C':
        this.connectToBackend();
        break;
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // Public methods for external control
  executeAction(actionText) {
    const actions = this.animationManager.parseActions(actionText);
    this.handleActionReceived({ actions });
  }

  disconnect() {
    if (this.apiClient) {
      this.apiClient.disconnect();
    }
    if (this.mockGenerator) {
      this.mockGenerator.stop();
    }
    this.updateConnectionStatus('disconnected');
  }

  async sendTextInput() {
    const text = this.elements.textInput?.value?.trim();

    if (!text) {
      this.updateTextStatus('Vui lòng nhập văn bản', 'error');
      return;
    }

    console.log('💬 Sending text input:', text);
    this.updateTextStatus('Đang xử lý...', 'processing');
    this.elements.sendTextBtn.disabled = true;

    try {
      // Send via WebSocket if connected
      if (this.apiClient.isConnected) {
        this.apiClient.sendTextInput(text);
        this.updateTextStatus('✅ Đã gửi lệnh', 'success');
        console.log('🎯 Text sent via WebSocket:', text);
      } else {
        // Fallback to HTTP API
        const response = await fetch('http://localhost:3001/api/analyze-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          this.updateTextStatus('✅ Đã gửi lệnh', 'success');
          console.log('🎯 Text analysis requested:', result);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Clear input after successful send
      this.elements.textInput.value = '';
    } catch (error) {
      console.error('❌ Error sending text:', error);
      this.updateTextStatus(`Lỗi: ${error.message}`, 'error');
    } finally {
      this.elements.sendTextBtn.disabled = false;
    }
  }

  updateTextStatus(message, type = 'default') {
    if (!this.elements.textStatus) return;

    this.elements.textStatus.textContent = message;
    this.elements.textStatus.className = `text-status ${type}`;

    // Auto-clear status after 3 seconds for success/error
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        this.elements.textStatus.textContent = 'Sẵn sàng nhận lệnh...';
        this.elements.textStatus.className = 'text-status';
      }, 3000);
    }
  }

  // Cleanup
  destroy() {
    this.disconnect();
    // Add any other cleanup here
  }
}

// Initialize the application when page loads
let princessBot;

// Start the application
document.addEventListener('DOMContentLoaded', () => {
  princessBot = new PrincessBot();
});

// Make it globally available for debugging
window.princessBot = princessBot;

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (princessBot) {
    princessBot.destroy();
  }
});
