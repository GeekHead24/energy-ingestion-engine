import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VehicleStatus } from './entities/vehicle-status.entity';
import { MeterStatus } from './entities/meter-status.entity';
import { VehicleTelemetry } from './entities/vehicle-telemetry.entity';
import { MeterTelemetry } from './entities/meter-telemetry.entity';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(VehicleStatus)
    private vehicleStatusRepo: Repository<VehicleStatus>,

    @InjectRepository(MeterStatus)
    private meterStatusRepo: Repository<MeterStatus>,

    @InjectRepository(VehicleTelemetry)
    private vehicleTelemetryRepo: Repository<VehicleTelemetry>,

    @InjectRepository(MeterTelemetry)
    private meterTelemetryRepo: Repository<MeterTelemetry>,
  ) {}

  async ingest(data: IngestTelemetryDto) {
    // VEHICLE STREAM
    if ('vehicleId' in data) {
      const timestamp = new Date(data.timestamp);

      // INSERT → cold table
      await this.vehicleTelemetryRepo.insert({
        vehicleId: data.vehicleId,
        soc: data.soc,
        kwhDeliveredDc: data.kwhDeliveredDc,
        batteryTemp: data.batteryTemp,
        timestamp,
      });

      // UPSERT → hot table
      await this.vehicleStatusRepo.upsert(
        {
          vehicleId: data.vehicleId,
          soc: data.soc,
          kwhDeliveredDc: data.kwhDeliveredDc,
          batteryTemp: data.batteryTemp,
        },
        ['vehicleId'],
      );

      return { type: 'vehicle', status: 'ok' };
    }

    // METER STREAM
    if ('meterId' in data) {
      const timestamp = new Date(data.timestamp);

      // INSERT → cold table
      await this.meterTelemetryRepo.insert({
        meterId: data.meterId,
        kwhConsumedAc: data.kwhConsumedAc,
        voltage: data.voltage,
        timestamp,
      });

      // UPSERT → hot table
      await this.meterStatusRepo.upsert(
        {
          meterId: data.meterId,
          kwhConsumedAc: data.kwhConsumedAc,
          voltage: data.voltage,
        },
        ['meterId'],
      );

      return { type: 'meter', status: 'ok' };
    }

    throw new Error('Invalid telemetry payload');
  }
}
