import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ActionAnalysisRequestDto {
  @ApiProperty({
    description: 'Text input to analyze for 3D actions',
    example: 'nhảy múa vui vẻ',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text: string;
}

export class ActionAnalysisDataDto {
  @ApiProperty({
    description: 'Generated action for 3D character',
    example: 'sit',
  })
  action: string;

  @ApiProperty({
    description: 'Natural language response from GPT',
    example: 'I will sit down right now',
  })
  response: string;

  @ApiProperty({
    description: 'URL to the generated audio file',
    example: 'https://cdn.example.com/action-analysis/tts_1234567890.wav',
  })
  urlAudio: string;

  @ApiProperty({
    description: 'Original input text',
    example: 'Sit down',
  })
  textInput: string;
}

export class ActionAnalysisResponseDto {
  @ApiProperty({
    description: 'Response data containing action and audio information',
    type: ActionAnalysisDataDto,
  })
  data: ActionAnalysisDataDto;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '07/12/2023 10:30:45',
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    example: '/api/action/analyze',
  })
  path: string;
}
