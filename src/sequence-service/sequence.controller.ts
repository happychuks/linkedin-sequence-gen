import { Controller, Post, Body } from '@nestjs/common';
import { GenerateSequenceDto } from '../ai-service/dto/generate-sequence.dto';
import { SequenceService } from './sequence.service';

@Controller('api')
export class SequenceController {
  constructor(private readonly seq: SequenceService) {}

  @Post('generate-sequence')
  generate(@Body() dto: GenerateSequenceDto) {
    return this.seq.generate(dto);
  }
}
