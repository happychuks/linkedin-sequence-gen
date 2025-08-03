import {
  IsString,
  IsUrl,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TOVDto {
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

export class GenerateSequenceDto {
  @ApiProperty({
    description: 'LinkedIn profile URL of the prospect',
    example: 'https://linkedin.com/in/happy-felix',
  })
  @IsUrl()
  prospect_url: string;

  @ApiProperty({
    description: 'Tone of voice configuration for messaging style',
    type: TOVDto,
  })
  @ValidateNested()
  @Type(() => TOVDto)
  tov_config: TOVDto;

  @ApiProperty({
    description: 'Context about your company for personalization',
    example: 'We help B2B companies automate sales and generate leads',
  })
  @IsString()
  company_context: string;

  @ApiProperty({
    description: 'Number of messages in the sequence',
    minimum: 1,
    maximum: 10,
    example: 3,
  })
  @IsNumber()
  sequence_length: number;
}
