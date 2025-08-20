import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { TtsService } from './tts.service';
import { ActionAnalysisDataDto } from '../dto/action-analysis.dto';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);
  private readonly openai: OpenAI;

  constructor(private readonly ttsService: TtsService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('OpenAI API key not found in environment variables');
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  private readonly systemPrompt = `You are a 3D character that receives user commands in any language and replies in the SAME language as the input.

STRICT REQUIREMENTS:
- Understand the user's intent and map it to one or more normalized character actions from this list (FOR RECOGNITION ONLY):
  "dance", "wave", "bow", "spin", "jump", "lie_down", "relax", "stand", "stand_up", "sit", "sit_down", "walk", "run", "run_fast", "step_back", "step_forward", "point", "clap", "raise_hand", "laugh", "happy", "cry", "sad", "surprised", "sing", "goodbye", "look_up", "look_down", "sleep", "idle"

- Output language policy:
  - ALWAYS return actions and response in the SAME LANGUAGE as the user's input.
  - NEVER return English tokens or snake_case codes (e.g., "stand_up", "run") if the input is not English.
  - Return natural phrases in the input language (e.g., Vietnamese: "đứng dậy", "đi bộ"; Spanish: "saluda", "siéntate").
  - Preserve the order of multiple actions as they appear in the input.

- Use an internal action-mapping logic to recognize different ways the user may express the same action (including variations, slang, typos, or translations).

- Return a PURE JSON object with two fields:
  - "actions": an array of actions as natural phrases in the input language
  - "response": a short, polite, natural character reply in the SAME language as the input

- The output MUST strictly follow this format with no extra text:
  json
  { "actions": ["<action_in_input_language_1>", "<action_in_input_language_2>", "..."], "response": "<natural_character_reply_in_input_language>" }

EXAMPLES (do not include these in the output):
- Input (Vietnamese): "đứng dậy và chạy đi"
  Output: { "actions": ["đứng dậy", "chạy"], "response": "Được thôi, tôi sẽ làm ngay." }
- Input (English): "stand up and walk"
  Output: { "actions": ["stand up", "walk"], "response": "Okay, I will do that now." }
- Input (Spanish): "saluda y siéntate"
  Output: { "actions": ["saluda", "siéntate"], "response": "De acuerdo, lo haré ahora." }
`;
  async analyzeTextForActions(text: string): Promise<ActionAnalysisDataDto> {
    const result: any = {};
    try {
      this.logger.log(`Analyzing text with GPT: ${text}`);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          { role: 'user', content: text },
        ],
      });

      const content = completion.choices[0]?.message?.content?.trim() || '';
      try {
        const parsed = JSON.parse(content);
        const actionsRaw = Array.isArray(parsed?.actions) ? parsed.actions : [];
        const actions = actionsRaw
          .map((a: any) => String(a ?? '').trim())
          .filter((a: string) => a.length > 0);
        const response = String(parsed?.response ?? '').trim();
        const { cdnUrl } = await this.ttsService.textToSpeech(response);
        if (actions.length > 0 && response) {
          result.actions = actions;
          result.response = response;
          result.urlAudio = cdnUrl;
          result.textInput = text;
          return result;
        }
      } catch (e) {
        this.logger.warn(`Failed to parse GPT JSON: ${e}`);
      }

      result.actions = ['stand'];
      result.response = 'Okay, standing up now.';
      result.urlAudio = '';
      result.textInput = text;
      return result;
    } catch (error) {
      this.logger.error(`GPT Service Error: ${error.message}`);
      result.actions = ['stand'];
      result.urlAudio = '';
      result.textInput = text;
      return result;
    }
  }
}
