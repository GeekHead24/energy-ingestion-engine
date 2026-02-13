import { Body, Controller, Post } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import type { IngestTelemetryDto } from './dto/ingest-telemetry.dto';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  ingest(@Body() body: IngestTelemetryDto) {
    return this.telemetryService.ingest(body);
  }
}
