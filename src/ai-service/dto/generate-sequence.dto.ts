import {
  IsString,
  IsUrl,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TOVDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  formality: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  warmth: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  directness: number;
}

export class GenerateSequenceDto {
  @IsUrl()
  prospect_url: string;

  @ValidateNested()
  @Type(() => TOVDto)
  tov_config: TOVDto;

  @IsString()
  company_context: string;

  @IsNumber()
  sequence_length: number;
}
