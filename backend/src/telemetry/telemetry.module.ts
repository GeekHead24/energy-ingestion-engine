import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';

import { VehicleStatus } from './entities/vehicle-status.entity';
import { MeterStatus } from './entities/meter-status.entity';
import { VehicleTelemetry } from './entities/vehicle-telemetry.entity';
import { MeterTelemetry } from './entities/meter-telemetry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleStatus,
      MeterStatus,
      VehicleTelemetry,
      MeterTelemetry,
    ]),
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class TelemetryModule {}
