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
- Understand the user's intent and map it to ONE normalized character action from this list:
  "dance", "wave", "bow", "spin", "jump", "lie_down", "relax", "stand", "stand_up", "sit", "sit_down", "walk", "run", "run_fast", "step_back", "step_forward", "point", "clap", "raise_hand", "laugh", "happy", "cry", "sad", "surprised", "sing", "goodbye", "look_up", "look_down", "sleep", "idle"

- Use an internal action-mapping logic to recognize different ways the user may express the same action (including variations, slang, typos, or translations).

- After identifying the correct action, return a PURE JSON object with two fields:
  - "action": the action, translated into the input language (not English if the input is not in English)
  - "response": a short, polite, natural character reply in the SAME language as the input

- The output MUST strictly follow this format:
  json
  { "action": "<translated_action>", "response": "<natural_character_reply>" }
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
        const action = String(parsed?.action ?? '').trim();
        const response = String(parsed?.response ?? '').trim();
        const { cdnUrl } = await this.ttsService.textToSpeech(response);
        if (action && response) {
          result.action = action;
          result.response = response;
          result.urlAudio = cdnUrl;
          result.textInput = text;
          return result;
        }
      } catch (e) {
        this.logger.warn(`Failed to parse GPT JSON: ${e}`);
      }

      result.action = 'stand';
      result.response = 'Okay, standing up now.';
      result.urlAudio = '';
      result.textInput = text;
      return result;
    } catch (error) {
      this.logger.error(`GPT Service Error: ${error.message}`);
      result.action = 'stand';
      result.urlAudio = '';
      result.textInput = text;
      return result;
    }
  }
}
