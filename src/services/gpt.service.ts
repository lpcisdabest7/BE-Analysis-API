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
- Understand the user's intent and choose ONLY ONE appropriate action from these 4 options, translated into the input language:
  - sleep
  - stand
  - sit
  - jump

- Then, generate a short, polite, and natural response in the SAME language as the input, appropriate to the chosen action.

- Return a PURE JSON object in the following exact format:
  { "action": "<translated_action>", "response": "<natural_character_reply>" }

- DO NOT return the action in English if the user's input is not in English.
- DO NOT include explanations, arrays, or additional fields.
- The output MUST be valid JSON and match the language of the input.

Examples:

User: "Go to sleep"  
{ "action": "sleep", "response": "Alright, I will go to sleep." }

User: "Ngồi xuống đi"  
{ "action": "ngồi", "response": "Tôi sẽ ngồi xuống ngay." }

User: "Please stand up"  
{ "action": "stand", "response": "Okay, standing up now." }

User: "Nhảy lên nào"  
{ "action": "nhảy", "response": "Tôi sẽ nhảy ngay bây giờ." }
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
