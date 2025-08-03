import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GenerateSequenceDto } from '../ai-service/dto/generate-sequence.dto';
import { SequenceService } from './sequence.service';

@ApiTags('LinkedIn Sequences')
@Controller('api')
export class SequenceController {
  constructor(private readonly seq: SequenceService) {}

  @Post('generate-sequence')
  @ApiOperation({
    summary: 'Generate LinkedIn outreach sequence',
    description:
      'Generate personalized LinkedIn messaging sequence using AI based on prospect profile and company context',
  })
  @ApiBody({
    type: GenerateSequenceDto,
    description: 'Sequence generation parameters',
  })
  @ApiResponse({
    status: 201,
    description: 'Sequence generated successfully',
    schema: {
      type: 'object',
      properties: {
        sequence: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              type: { type: 'string' },
              confidence: { type: 'number' },
              aiReasoning: { type: 'string' },
            },
          },
        },
        thinking_process: { type: 'object' },
        prospect_analysis: { type: 'string' },
        metadata: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input parameters',
  })
  generate(@Body() dto: GenerateSequenceDto) {
    return this.seq.generate(dto);
  }

  @Get('history/:prospectId')
  @ApiOperation({
    summary: 'Get prospect sequence history',
    description:
      'Retrieve all previously generated sequences for a specific prospect',
  })
  @ApiParam({
    name: 'prospectId',
    type: 'number',
    description: 'Unique identifier of the prospect',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sequence history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sequence: { type: 'array' },
          thinking_process: { type: 'object' },
          prospect_analysis: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Prospect not found',
  })
  history(@Param('prospectId', ParseIntPipe) prospectId: number) {
    return this.seq.history(prospectId);
  }
}
