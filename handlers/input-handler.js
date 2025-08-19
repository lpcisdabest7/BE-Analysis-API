class InputHandler {
  constructor(gptService, socketServer) {
    this.gptService = gptService;
    this.socketServer = socketServer;
    this.processingQueue = [];
    this.isProcessing = false;
  }

  async handleTextInput(text, socketId = null) {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      console.warn("⚠️ Invalid text input received");
      return {
        success: false,
        error: "Invalid text input",
      };
    }

    const inputData = {
      text: text.trim(),
      timestamp: new Date(),
      socketId: socketId,
    };

    console.log("📝 Processing text input:", inputData.text);

    // Add to processing queue
    this.processingQueue.push(inputData);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return {
      success: true,
      message: "Text input queued for processing",
      queueLength: this.processingQueue.length,
    };
  }

  async processQueue() {
    if (this.processingQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const inputData = this.processingQueue.shift();

    try {
      // Send to GPT for analysis
      const gptResponse = await this.gptService.analyzeTextForActions(
        inputData.text
      );
      const parsedResponse = this.gptService.parseGPTResponse(gptResponse);

      console.log("🎯 Actions identified:", parsedResponse.actions);

      // Send actions to frontend via socket
      const actionData = {
        actions: parsedResponse.actions,
        originalText: inputData.text,
        gptMessage: parsedResponse.message,
        timestamp: inputData.timestamp,
        type: "text-analysis",
      };

      this.socketServer.broadcastAction(actionData);

      // Log success
      console.log(
        `✅ Successfully processed: "${
          inputData.text
        }" → ${parsedResponse.actions.join(", ")}`
      );
    } catch (error) {
      console.error("❌ Error processing input:", error);

      // Send error action to frontend
      this.socketServer.broadcastAction({
        actions: ["idle"],
        originalText: inputData.text,
        gptMessage: "Error processing request",
        timestamp: inputData.timestamp,
        type: "error",
        error: error.message,
      });
    }

    // Continue processing queue
    setTimeout(() => this.processQueue(), 500); // Small delay between processing
  }

  getQueueStatus() {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
    };
  }

  clearQueue() {
    this.processingQueue = [];
    this.isProcessing = false;
    console.log("🧹 Input processing queue cleared");
  }
}

module.exports = InputHandler;
