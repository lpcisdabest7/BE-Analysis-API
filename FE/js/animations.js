// Animation utilities and action mapping
class AnimationManager {
  constructor(princess3d) {
    this.princess3d = princess3d;
    this.actionMapping = this.createActionMapping();
  }

  createActionMapping() {
    return {
      // Core actions (existing)
      "nhảy múa": "dance",
      "nhay mua": "dance",
      múa: "dance",
      dance: "dance",
      dancing: "dance",

      "vẫy tay": "wave",
      "vay tay": "wave",
      chào: "wave",
      wave: "wave",
      waving: "wave",
      hello: "wave",

      "cúi chào": "bow",
      "cui chao": "bow",
      "cúi đầu": "bow",
      bow: "bow",
      bowing: "bow",

      "quay tròn": "spin",
      "quay tron": "spin",
      xoay: "spin",
      spin: "spin",
      spinning: "spin",
      rotate: "spin",

      "nhảy lên": "jump",
      "nhay len": "jump",
      "bật nhảy": "jump",
      jump: "jump",
      jumping: "jump",
      leap: "jump",

      // Extended actions - Position/Posture
      "nằm xuống": "lie_down",
      "nam xuong": "lie_down",
      nằm: "lie_down",
      "lie down": "lie_down",
      lying: "lie_down",
      "thư giãn": "relax",
      "thu gian": "relax",
      relax: "relax",

      "đứng dậy": "stand_up",
      "dung day": "stand_up",
      đứng: "stand",
      "stand up": "stand_up",
      stand: "stand",
      standing: "stand",

      "ngồi xuống": "sit_down",
      "ngoi xuong": "sit_down",
      ngồi: "sit",
      "sit down": "sit_down",
      sit: "sit",
      sitting: "sit",

      // Movement actions
      "đi bộ": "walk",
      "di bo": "walk",
      đi: "walk",
      walk: "walk",
      walking: "walk",

      chạy: "run",
      chay: "run",
      "chạy nhanh": "run_fast",
      run: "run",
      running: "run",

      "lùi lại": "step_back",
      "lui lai": "step_back",
      "step back": "step_back",
      backward: "step_back",

      "tiến tới": "step_forward",
      "tien toi": "step_forward",
      "step forward": "step_forward",
      forward: "step_forward",

      // Gestures
      "chỉ tay": "point",
      "chi tay": "point",
      point: "point",
      pointing: "point",

      "vỗ tay": "clap",
      "vo tay": "clap",
      clap: "clap",
      clapping: "clap",

      "giơ tay": "raise_hand",
      "gio tay": "raise_hand",
      "raise hand": "raise_hand",

      // Emotions/Expressions
      cười: "laugh",
      cuoi: "laugh",
      laugh: "laugh",
      laughing: "laugh",
      "vui vẻ": "happy",
      "vui ve": "happy",
      happy: "happy",

      khóc: "cry",
      khoc: "cry",
      cry: "cry",
      crying: "cry",
      buồn: "sad",
      buon: "sad",
      sad: "sad",

      "ngạc nhiên": "surprised",
      "ngac nhien": "surprised",
      surprised: "surprised",
      shock: "surprised",

      // Special actions
      "ca hát": "sing",
      "ca hat": "sing",
      sing: "sing",
      singing: "sing",

      "tạm biệt": "goodbye",
      "tam biet": "goodbye",
      goodbye: "goodbye",
      bye: "goodbye",

      "ngẩng đầu": "look_up",
      "ngang dau": "look_up",
      "look up": "look_up",

      "cúi xuống": "look_down",
      "cui xuong": "look_down",
      "look down": "look_down",

      // Default/Idle
      "đứng yên": "idle",
      "dung yen": "idle",
      nghỉ: "idle",
      idle: "idle",
      rest: "idle",
      stop: "idle",
      "không làm gì": "idle",
    };
  }

  parseActions(actionText) {
    try {
      // Try to parse as JSON first (from GPT response)
      if (actionText.includes("{") && actionText.includes("}")) {
        const jsonMatch = actionText.match(/\{[^}]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.actions && Array.isArray(parsed.actions)) {
            // Map GPT actions to our animation system
            return parsed.actions.map((action) =>
              this.mapGPTActionToAnimation(action)
            );
          }
        }
      }

      // If actionText is an array, process each action
      if (Array.isArray(actionText)) {
        return actionText.map((action) => this.mapGPTActionToAnimation(action));
      }

      // If not JSON, try to extract actions from text
      const actions = [];
      const text = actionText.toLowerCase();

      // Check each mapped action
      for (const [vietnamese, english] of Object.entries(this.actionMapping)) {
        if (text.includes(vietnamese)) {
          actions.push(english);
        }
      }

      // If no actions found, try to map the whole text as an action
      if (actions.length === 0) {
        const mappedAction = this.mapGPTActionToAnimation(actionText);
        if (
          mappedAction !== "idle" ||
          actionText.toLowerCase().includes("idle")
        ) {
          actions.push(mappedAction);
        }
      }

      // If still no actions found, return default
      return actions.length > 0 ? actions : ["idle"];
    } catch (error) {
      console.error("Error parsing actions:", error);
      return ["idle"];
    }
  }

  // Map GPT-generated actions to our animation system
  mapGPTActionToAnimation(gptAction) {
    if (!gptAction || typeof gptAction !== "string") {
      return "idle";
    }

    const action = gptAction.toLowerCase().trim();

    // Direct mapping first
    if (this.actionMapping[action]) {
      return this.actionMapping[action];
    }

    // Comprehensive fuzzy matching for flexible actions
    const actionMappings = {
      // Position/Posture - Extended
      nằm: "lie_down",
      lying: "lie_down",
      lie: "lie_down",
      "nằm xuống": "lie_down",
      "nằm ra": "lie_down",
      "nằm dài": "lie_down",
      "thư giãn": "relax",
      "nghỉ ngơi": "relax",
      rest: "relax",

      đứng: "stand",
      stand: "stand",
      "đứng dậy": "stand_up",
      "đứng lên": "stand_up",
      "đứng thẳng": "stand",

      ngồi: "sit",
      sit: "sit",
      "ngồi xuống": "sit_down",
      "ngồi nghỉ": "sit",

      // Movement - Extended
      đi: "walk",
      walk: "walk",
      "đi bộ": "walk",
      "di chuyển": "walk",
      "bước đi": "walk",

      chạy: "run",
      run: "run",
      "chạy nhanh": "run_fast",
      "chạy thật nhanh": "run_fast",
      "vội vã": "run",
      "nhanh lên": "run",
      running: "run",

      bay: "fly",
      fly: "jump", // Map to jump as closest action
      "bay lên": "jump",
      "nhảy cao": "jump",

      lăn: "roll",
      roll: "spin", // Map to spin as closest action
      "lăn tròn": "spin",

      bò: "crawl",
      crawl: "crouch", // Map to crouch-like action
      "bò lết": "crouch",

      // Emotions - Extended
      cười: "laugh",
      laugh: "laugh",
      "cười to": "laugh",
      "cười nhẹ": "smile",
      smile: "happy",

      vui: "happy",
      happy: "happy",
      "vui vẻ": "happy",
      "hạnh phúc": "happy",
      "vui mừng": "happy",
      "phấn khích": "excited",
      excited: "dance", // Map to dance for excitement

      buồn: "sad",
      sad: "sad",
      khóc: "cry",
      cry: "cry",
      "buồn bã": "sad",
      "thất vọng": "sad",

      giận: "angry",
      angry: "angry",
      "giận dữ": "angry",
      "bực tức": "angry",
      "khó chịu": "angry",
      mad: "angry",

      sợ: "scared",
      scared: "scared",
      "sợ hãi": "scared",
      "hoảng sợ": "scared",
      fear: "scared",

      "ngạc nhiên": "surprised",
      surprised: "surprised",
      shock: "surprised",
      "bất ngờ": "surprised",

      // Gestures - Extended
      vẫy: "wave",
      wave: "wave",
      chào: "wave",
      hello: "wave",
      "vẫy tay": "wave",

      cúi: "bow",
      bow: "bow",
      "chào hỏi": "bow",
      "cúi đầu": "bow",

      nhảy: "jump",
      jump: "jump",
      "nhảy lên": "jump",
      "bật nhảy": "jump",

      "nhảy múa": "dance",
      dance: "dance",
      múa: "dance",
      "khiêu vũ": "dance",

      quay: "spin",
      spin: "spin",
      xoay: "spin",
      "quay tròn": "spin",
      "xoay tròn": "spin",

      "vỗ tay": "clap",
      clap: "clap",
      "vỗ tay vào": "clap",

      chỉ: "point",
      point: "point",
      "chỉ tay": "point",
      "chỉ về": "point",

      "giơ tay": "raise_hand",
      "raise hand": "raise_hand",
      "nâng tay": "raise_hand",

      ôm: "hug",
      hug: "hug",
      "ôm ấp": "hug",
      embrace: "hug",

      đẩy: "push",
      push: "push",
      "đẩy mạnh": "push",

      kéo: "pull",
      pull: "pull",
      "kéo về": "pull",

      // Special Actions - Extended
      "ca hát": "sing",
      sing: "sing",
      hát: "sing",
      "hát bài": "sing",

      "tạm biệt": "goodbye",
      goodbye: "goodbye",
      bye: "goodbye",
      "chào tạm biệt": "goodbye",

      "võ thuật": "martial_arts",
      "martial arts": "martial_arts",
      "đánh võ": "martial_arts",
      karate: "martial_arts",
      "kung fu": "martial_arts",

      yoga: "yoga",
      "tập yoga": "yoga",
      meditation: "meditate",
      "thiền định": "meditate",

      "thể dục": "exercise",
      exercise: "exercise",
      "tập thể dục": "exercise",
      workout: "exercise",

      "lén lút": "sneak",
      sneak: "sneak",
      "đi lén": "sneak",
      "nhanh nhẹn": "agile",
      agile: "quick",

      // Creative/Abstract actions
      "tự do": "free",
      free: "dance", // Express freedom through dance
      freedom: "dance",

      "mạnh mẽ": "strong",
      strong: "flex", // Show strength
      power: "flex",

      "dịu dàng": "gentle",
      gentle: "soft_movement",
      soft: "gentle",

      "điên cuồng": "crazy",
      crazy: "wild_dance",
      wild: "wild_dance",
    };

    // Try fuzzy matching
    for (const [key, value] of Object.entries(actionMappings)) {
      if (action.includes(key) || key.includes(action)) {
        return value;
      }
    }

    // Advanced pattern matching for creative actions
    const patterns = [
      // Movement patterns
      { pattern: /chạy|nhanh|vội|rush|speed/i, action: "run" },
      { pattern: /đi|walk|move|di chuyển/i, action: "walk" },
      { pattern: /nhảy|jump|hop|leap/i, action: "jump" },
      { pattern: /bay|fly|lên cao|up high/i, action: "jump" },
      { pattern: /quay|spin|xoay|turn|rotate/i, action: "spin" },
      { pattern: /nằm|lie|rest|nghỉ/i, action: "lie_down" },
      { pattern: /ngồi|sit|down/i, action: "sit" },
      { pattern: /đứng|stand|up/i, action: "stand" },

      // Emotion patterns
      { pattern: /cười|laugh|smile|vui|happy|hạnh phúc/i, action: "laugh" },
      { pattern: /buồn|sad|khóc|cry|thất vọng/i, action: "sad" },
      { pattern: /giận|angry|mad|bực|tức/i, action: "angry" },
      { pattern: /sợ|scared|fear|hãi/i, action: "scared" },
      { pattern: /ngạc nhiên|surprised|shock|bất ngờ/i, action: "surprised" },

      // Gesture patterns
      { pattern: /vẫy|wave|chào|hello/i, action: "wave" },
      { pattern: /cúi|bow|chào hỏi/i, action: "bow" },
      { pattern: /vỗ|clap|applaud/i, action: "clap" },
      { pattern: /chỉ|point|indicate/i, action: "point" },
      { pattern: /giơ|raise|nâng/i, action: "raise_hand" },
      { pattern: /ôm|hug|embrace/i, action: "hug" },

      // Special patterns
      { pattern: /múa|dance|nhảy múa|khiêu vũ/i, action: "dance" },
      { pattern: /hát|sing|ca hát/i, action: "sing" },
      { pattern: /võ|martial|karate|kung fu/i, action: "martial_arts" },
      { pattern: /yoga|thiền|meditate/i, action: "yoga" },
      { pattern: /thể dục|exercise|workout/i, action: "exercise" },

      // Creative patterns
      { pattern: /mạnh|strong|power|sức mạnh/i, action: "flex" },
      { pattern: /dịu|gentle|soft|nhẹ nhàng/i, action: "gentle" },
      { pattern: /điên|crazy|wild|cuồng/i, action: "wild_dance" },
      { pattern: /tự do|free|freedom/i, action: "dance" },
      { pattern: /ninja|lén|sneak/i, action: "sneak" },
    ];

    // Try pattern matching
    for (const { pattern, action: mappedAction } of patterns) {
      if (pattern.test(action)) {
        return mappedAction;
      }
    }

    // If still no match, create a meaningful action based on word analysis
    const words = action.split(/\s+/);
    for (const word of words) {
      // Check if any word matches our patterns
      for (const { pattern, action: mappedAction } of patterns) {
        if (pattern.test(word)) {
          return mappedAction;
        }
      }
    }

    // Final fallback - create a custom action name
    // Convert to snake_case and ensure it's animation-friendly
    let customAction = action.replace(/\s+/g, "_").toLowerCase();

    // Add some intelligence to unknown actions
    if (customAction.length > 20) {
      customAction = customAction.substring(0, 20); // Limit length
    }

    // If the action seems like movement, default to appropriate animation
    if (/move|go|come|forward|backward/.test(customAction)) {
      return "walk";
    }
    if (/fast|quick|speed/.test(customAction)) {
      return "run";
    }
    if (/up|high|above/.test(customAction)) {
      return "jump";
    }
    if (/down|low|below/.test(customAction)) {
      return "sit";
    }

    // Return the custom action - the 3D system will handle it
    return customAction || "idle";
  }

  executeActions(actions) {
    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    console.log("🎭 Executing actions:", actions);

    // Execute first action immediately
    if (actions.length > 0) {
      this.princess3d.playAction(actions[0]);

      // If multiple actions, chain them
      if (actions.length > 1) {
        this.chainActions(actions.slice(1), 0);
      }
    }
  }

  chainActions(actions, index) {
    if (index >= actions.length) return;

    // Wait for current animation to complete, then play next
    setTimeout(() => {
      this.princess3d.playAction(actions[index]);
      this.chainActions(actions, index + 1);
    }, 3000); // 3 second delay between actions
  }

  getRandomAction() {
    const actions = ["dance", "wave", "bow", "spin", "jump"];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  // Analyze text sentiment to choose appropriate action
  analyzeTextForAction(text) {
    const lowerText = text.toLowerCase();

    // Happy/energetic words -> dance
    if (lowerText.match(/(vui|hạnh phúc|vui vẻ|hào hứng|excited|happy|joy)/)) {
      return "dance";
    }

    // Greeting words -> wave
    if (lowerText.match(/(xin chào|chào|hello|hi|greeting)/)) {
      return "wave";
    }

    // Polite/formal words -> bow
    if (lowerText.match(/(cảm ơn|xin lỗi|thank|sorry|please|formal)/)) {
      return "bow";
    }

    // Movement words -> spin
    if (lowerText.match(/(di chuyển|xoay|quay|move|turn)/)) {
      return "spin";
    }

    // Energetic words -> jump
    if (lowerText.match(/(nhảy|bật|leap|jump|bounce)/)) {
      return "jump";
    }

    // Default
    return "idle";
  }
}

// Action queue manager for handling multiple actions
class ActionQueue {
  constructor(animationManager) {
    this.animationManager = animationManager;
    this.queue = [];
    this.isProcessing = false;
  }

  addAction(action) {
    this.queue.push({
      action,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9),
    });

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const actionItem = this.queue.shift();

    console.log("🎬 Processing action from queue:", actionItem.action);

    // Execute the action
    this.animationManager.executeActions([actionItem.action]);

    // Wait for action to complete before processing next
    setTimeout(() => {
      this.processQueue();
    }, 4000); // 4 seconds per action
  }

  clearQueue() {
    this.queue = [];
    this.isProcessing = false;
  }

  getQueueStatus() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      nextAction: this.queue.length > 0 ? this.queue[0].action : null,
    };
  }
}
