import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { GenerateSequenceDto } from '../ai-service/dto/generate-sequence.dto';
import { RefineSequenceDto } from '../ai-service/dto/refine-sequence.dto';
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

  @Post('refine-sequence')
  @ApiOperation({
    summary: 'Refine existing sequence with new TOV parameters',
    description:
      'Generate a refined version of an existing sequence using different tone of voice parameters',
  })
  @ApiBody({
    type: RefineSequenceDto,
    description: 'Sequence refinement parameters',
  })
  @ApiResponse({
    status: 201,
    description: 'Sequence refined successfully',
    schema: {
      type: 'object',
      properties: {
        refinedSequence: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            messages: { type: 'array' },
            version: { type: 'number' },
            tovFormality: { type: 'number' },
            tovWarmth: { type: 'number' },
            tovDirectness: { type: 'number' },
          },
        },
        originalSequence: { type: 'object' },
        changes: {
          type: 'object',
          properties: {
            tov: { type: 'object' },
            sequenceLength: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid refinement parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'Original sequence not found',
  })
  refine(@Body() dto: RefineSequenceDto) {
    return this.seq.refine(dto);
  }

  @Get('refinements/:sequenceId')
  @ApiOperation({
    summary: 'Get sequence refinement history',
    description: 'Retrieve all refinements for a specific sequence',
  })
  @ApiParam({
    name: 'sequenceId',
    type: 'number',
    description: 'Unique identifier of the original sequence',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Refinement history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          version: { type: 'number' },
          tovFormality: { type: 'number' },
          tovWarmth: { type: 'number' },
          tovDirectness: { type: 'number' },
          messages: { type: 'array' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sequence not found',
  })
  getRefinements(@Param('sequenceId', ParseIntPipe) sequenceId: number) {
    return this.seq.getRefinements(sequenceId);
  }

  @Get('compare')
  @ApiOperation({
    summary: 'Compare multiple sequence versions',
    description:
      'Compare differences between sequence versions including TOV changes, length differences, and message variations',
  })
  @ApiQuery({
    name: 'originalId',
    description: 'ID of the original sequence',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'refinedId',
    description: 'ID of the refined sequence',
    required: true,
    type: Number,
    example: 4,
  })
  @ApiResponse({
    status: 200,
    description: 'Sequence comparison completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid sequence IDs provided',
  })
  @ApiResponse({
    status: 404,
    description: 'One or more sequences not found',
  })
  compareVersions(
    @Query('originalId') originalId: string,
    @Query('refinedId') refinedId: string,
  ) {
    // Validate input parameters
    const originalIdNum = parseInt(originalId, 10);
    const refinedIdNum = parseInt(refinedId, 10);

    if (
      isNaN(originalIdNum) ||
      isNaN(refinedIdNum) ||
      originalIdNum <= 0 ||
      refinedIdNum <= 0
    ) {
      throw new BadRequestException(
        'Invalid sequence IDs. Both originalId and refinedId must be positive integers.',
      );
    }

    const sequenceIds = [originalIdNum, refinedIdNum];
    return this.seq.compareVersions(sequenceIds);
  }
}
