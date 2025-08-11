import {
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TOVRefinementDto {
  @ApiProperty({
    description: 'Formality level of the messaging tone',
    minimum: 0,
    maximum: 1,
    example: 0.9,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  formality: number;

  @ApiProperty({
    description: 'Warmth level of the messaging tone',
    minimum: 0,
    maximum: 1,
    example: 0.8,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  warmth: number;

  @ApiProperty({
    description: 'Directness level of the messaging tone',
    minimum: 0,
    maximum: 1,
    example: 0.7,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  directness: number;
}

export class RefineSequenceDto {
  @ApiProperty({
    description: 'ID of the original sequence to refine',
    example: 123,
  })
  @IsInt()
  @Min(1)
  originalSequenceId: number;

  @ApiProperty({
    description: 'New tone of voice configuration for refinement',
    type: TOVRefinementDto,
  })
  @ValidateNested()
  @Type(() => TOVRefinementDto)
  newTovConfig: TOVRefinementDto;

  @ApiProperty({
    description: 'Optional new sequence length (1-4 messages)',
    minimum: 1,
    maximum: 4,
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  newSequenceLength?: number;
}
