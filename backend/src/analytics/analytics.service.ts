import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VehicleTelemetry } from '../telemetry/entities/vehicle-telemetry.entity';
import { MeterTelemetry } from '../telemetry/entities/meter-telemetry.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(VehicleTelemetry)
    private vehicleRepo: Repository<VehicleTelemetry>,

    @InjectRepository(MeterTelemetry)
    private meterRepo: Repository<MeterTelemetry>,
  ) {}

  async getVehiclePerformance(vehicleId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // DC + Avg Temp (vehicle telemetry)
    const vehicleStats = await this.vehicleRepo
      .createQueryBuilder('v')
      .select('SUM(v.kwhDeliveredDc)', 'totalDc')
      .addSelect('AVG(v.batteryTemp)', 'avgTemp')
      .where('v.vehicleId = :vehicleId', { vehicleId })
      .andWhere('v.timestamp >= :since', { since })
      .getRawOne();

    // AC consumed (meter telemetry)
    const meterStats = await this.meterRepo
      .createQueryBuilder('m')
      .select('SUM(m.kwhConsumedAc)', 'totalAc')
      .where('m.timestamp >= :since', { since })
      .getRawOne();

    const totalDc = Number(vehicleStats?.totalDc || 0);
    const totalAc = Number(meterStats?.totalAc || 0);
    const avgTemp = Number(vehicleStats?.avgTemp || 0);

    const efficiency = totalAc > 0 ? totalDc / totalAc : 0;

    return {
      vehicleId,
      last24h: {
        totalAc,
        totalDc,
        efficiency,
        avgBatteryTemp: avgTemp,
      },
    };
  }
}
