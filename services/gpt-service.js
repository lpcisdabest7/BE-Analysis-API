const fetch = require("cross-fetch");

class GPTService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async analyzeTextForActions(text) {
    try {
      console.log("🤖 Analyzing text with GPT:", text);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `Bạn là một AI sáng tạo phân tích hành động cho nhân vật 3D. Nhiệm vụ của bạn là LUÔN LUÔN tạo ra hành động phù hợp từ bất kỳ câu lệnh nào của người dùng.

NGUYÊN TẮC QUAN TRỌNG:
- KHÔNG BAO GIỜ trả về mảng rỗng [] 
- LUÔN LUÔN tìm cách hiểu và tạo ra ít nhất 1 hành động
- Hãy sáng tạo và linh hoạt trong việc diễn giải lời nói
- Nếu không chắc chắn, hãy đoán một cách hợp lý

CÁCH XỬ LÝ:
1. Phân tích từ khóa chính trong câu
2. Tìm động từ hoặc ý định hành động
3. Chuyển đổi thành hành động cụ thể cho nhân vật 3D
4. Có thể kết hợp nhiều hành động nếu cần

LOẠI HÀNH ĐỘNG CÓ THỂ TẠO:
- Chuyển động: chạy, đi, nhảy, quay, lăn, trượt, bay, bò
- Tư thế: nằm, ngồi, đứng, cúi, nghiêng, duỗi, co
- Cử chỉ: vẫy, chỉ, vỗ, ôm, đẩy, kéo, nắm, thả
- Biểu cảm: cười, khóc, giận, ngạc nhiên, sợ, yêu
- Đặc biệt: nhảy múa, ca hát, võ thuật, yoga, thể dục

VÍ DỤ SÁNG TẠO:
- "chạy ngay đi" → ["chạy nhanh", "vội vã", "di chuyển"]
- "nằm ra" → ["nằm xuống", "thư giãn", "nghỉ ngơi"]
- "làm gì đó vui" → ["nhảy múa", "cười", "vui vẻ"]
- "giận quá" → ["giận dữ", "bực tức", "khó chịu"]
- "bay lên trời" → ["nhảy cao", "bay", "tự do"]
- "như ninja" → ["lén lút", "nhanh nhẹn", "võ thuật"]

LUÔN TRẢ VỀ: {"actions": ["action1", "action2", ...], "message": "giải thích"}
KHÔNG BAO GIỜ để actions = []`,
              },
              { role: "user", content: text },
            ],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const result =
        data.choices?.[0]?.message?.content ||
        '{"actions": ["idle"], "message": "Không thể phân tích"}';

      console.log("🤖 GPT Response:", result);
      return result;
    } catch (error) {
      console.error("❌ GPT Service Error:", error.message);
      return '{"actions": ["idle"], "message": "Lỗi kết nối GPT"}';
    }
  }

  parseGPTResponse(responseText) {
    try {
      const parsed = JSON.parse(responseText);
      let actions = parsed.actions;

      // Ensure we always have actions
      if (!Array.isArray(actions) || actions.length === 0) {
        // Try to extract actions from the message or response text
        actions = this.extractActionsFromText(responseText);
      }

      // Final fallback - ensure we never return empty actions
      if (!actions || actions.length === 0) {
        actions = ["dance"]; // Default to dance instead of idle for more engagement
      }

      return {
        actions: actions,
        message: parsed.message || "Action generated",
      };
    } catch (error) {
      console.warn(
        "⚠️ Failed to parse GPT response, extracting actions from text"
      );

      // Try to extract actions from raw text
      const extractedActions = this.extractActionsFromText(responseText);

      return {
        actions: extractedActions.length > 0 ? extractedActions : ["dance"],
        message: "Extracted from response",
      };
    }
  }

  // Helper method to extract actions from any text
  extractActionsFromText(text) {
    const actionKeywords = [
      // Vietnamese actions
      "nhảy múa",
      "dance",
      "múa",
      "chạy",
      "run",
      "nhanh",
      "nằm",
      "lie",
      "nghỉ",
      "đứng",
      "stand",
      "dậy",
      "ngồi",
      "sit",
      "cười",
      "laugh",
      "vui",
      "vẫy",
      "wave",
      "chào",
      "cúi",
      "bow",
      "quay",
      "spin",
      "xoay",
      "nhảy",
      "jump",
      "đi",
      "walk",
      "bộ",
      "hát",
      "sing",
      "vỗ",
      "clap",
      "giận",
      "angry",
      "buồn",
      "sad",
      "khóc",
      "bay",
      "fly",
      "ôm",
      "hug",
      "chỉ",
      "point",
    ];

    const foundActions = [];
    const lowerText = text.toLowerCase();

    for (const keyword of actionKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundActions.push(keyword);
        if (foundActions.length >= 3) break; // Limit to 3 actions max
      }
    }

    return foundActions.length > 0 ? foundActions : [];
  }
}

module.exports = GPTService;
