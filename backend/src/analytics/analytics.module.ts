import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

import { VehicleTelemetry } from '../telemetry/entities/vehicle-telemetry.entity';
import { MeterTelemetry } from '../telemetry/entities/meter-telemetry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VehicleTelemetry, MeterTelemetry]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
