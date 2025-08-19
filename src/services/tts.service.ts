import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@deepgram/sdk';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly deepgram: any;
  private readonly audioDir = path.join(process.cwd(), 'public', 'audio');

  constructor(private readonly s3Service: S3Service) {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      this.logger.warn('Deepgram API key not found in environment variables');
      throw new Error('DEEPGRAM_API_KEY is required');
    }

    this.deepgram = createClient(apiKey);

    // Tạo thư mục audio nếu chưa tồn tại
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async textToSpeech(text: string): Promise<{ cdnUrl: string }> {
    try {
      this.logger.log(`Converting text to speech: ${text}`);

      // Tạo tên file unique
      const timestamp = Date.now();
      const fileName = `tts_${timestamp}.wav`;
      // Không tạo file local

      // Gọi Deepgram TTS API
      const response = await this.deepgram.speak.request(
        { text: text },
        {
          model: 'aura-asteria-en', // Model cho tiếng Anh
          encoding: 'linear16',
          container: 'wav',
          sample_rate: 48000,
        },
      );

      // Lấy audio stream → buffer (không lưu file)
      const stream = await response.getStream();
      if (stream) {
        const buffer = await this.getAudioBuffer(stream);

        // Upload to S3 via presigned URL
        const { presignedUrl, objectKey } =
          await this.s3Service.generatePresignedPutUrlFromName(fileName);

        await axios.put(presignedUrl, buffer, {
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Disposition': `inline; filename="${fileName}"`,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        });

        // Trả về S3 key và CDN URL
        const cdnUrl = await this.s3Service.getAudioUrl(objectKey);
        this.logger.log(`Audio uploaded to S3: ${objectKey}`);
        return { cdnUrl };
      } else {
        throw new Error('Failed to get audio stream from Deepgram');
      }
    } catch (error) {
      this.logger.error(`TTS Service Error: ${error.message}`);
      throw error;
    }
  }

  private async getAudioBuffer(
    response: ReadableStream<Uint8Array>,
  ): Promise<Buffer> {
    const reader = response.getReader();
    const chunks: Uint8Array[] = [];

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const dataArray = chunks.reduce(
      (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
      new Uint8Array(0),
    );

    return Buffer.from(dataArray.buffer);
  }

  // Phương thức để xóa file audio cũ (optional - để cleanup)
  cleanupOldFiles(maxAgeHours = 24): void {
    try {
      const files = fs.readdirSync(this.audioDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(this.audioDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          this.logger.log(`Deleted old audio file: ${file}`);
        }
      });
    } catch (error) {
      this.logger.error(`Error cleaning up files: ${error.message}`);
    }
  }
}
