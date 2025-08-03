import { Controller } from '@nestjs/common';
import { SequenceService } from './sequence.service';

@Controller('api')
export class SequenceController {
  constructor(private readonly seq: SequenceService) {}
}
