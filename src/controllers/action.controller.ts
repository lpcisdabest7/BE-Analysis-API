import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  Logger,
  ValidationPipe,
  UsePipes,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GptService } from '../services/gpt.service';
import {
  ActionAnalysisRequestDto,
  ActionAnalysisResponseDto,
} from '../dto/action-analysis.dto';

@ApiTags('action')
@Controller('api/action')
export class ActionController {
  private readonly logger = new Logger(ActionController.name);

  constructor(private readonly gptService: GptService) {}

  private formatTimestamp(date = new Date()): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const d = pad(date.getDate());
    const m = pad(date.getMonth() + 1);
    const y = date.getFullYear();
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
  }

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze text and generate 3D character actions',
    description:
      'Takes text input and returns appropriate 3D character actions using GPT analysis',
  })
  @ApiBody({
    type: ActionAnalysisRequestDto,
    description: 'Text to analyze for actions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Action analysis completed successfully',
    type: ActionAnalysisResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input provided',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error during analysis',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async analyzeText(
    @Body() actionAnalysisDto: ActionAnalysisRequestDto,
    @Req() req: Request,
  ) {
    try {
      this.logger.log(`Analyzing text: ${actionAnalysisDto.text}`);

      const gptResult = await this.gptService.analyzeTextForActions(
        actionAnalysisDto.text,
      );
      const response = {
        data: {
          action: gptResult.action,
          urlAudio: gptResult.urlAudio,
          textInput: gptResult.textInput,
        },
        timestamp: this.formatTimestamp(new Date()),
        path: req.originalUrl,
      };

      this.logger.log(
        `Generated action: ${gptResult.action}, response: ${gptResult.response} for text: ${actionAnalysisDto.text}`,
      );
      return response;
    } catch (error) {
      this.logger.error(`Error analyzing text: ${error.message}`, error.stack);

      return {
        data: {
          action: 'stand',
          response: 'Okay, standing up',
          urlAudio: '',
          textinput: actionAnalysisDto.text,
        },
        timestamp: this.formatTimestamp(new Date()),
        path: req.originalUrl,
      };
    }
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the health status of the action analysis service',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is healthy',
  })
  async healthCheck(@Req() req: Request) {
    return {
      data: {
        status: 'ok',
        service: 'Action Analysis API',
        version: '1.0.0',
      },
      timestamp: this.formatTimestamp(new Date()),
      path: req.originalUrl,
    };
  }
}
