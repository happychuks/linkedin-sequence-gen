import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiAdapter } from './ai-adapter.interface';

@Injectable()
export class AiAdapterFactory {
  private readonly logger = new Logger(AiAdapterFactory.name);
  private adapter: AiAdapter;

  constructor(private configService: ConfigService) {}
}
