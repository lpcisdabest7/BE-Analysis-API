import { Module } from '@nestjs/common';
import { ActionController } from '../controllers/action.controller';
import { GptService } from '../services/gpt.service';
import { TtsService } from '../services/tts.service';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [ActionController],
  providers: [GptService, TtsService],
  exports: [GptService, TtsService],
})
export class ActionModule {}
