export type MeterPayload = {
  meterId: string;
  kwhConsumedAc: number;
  voltage: number;
  timestamp: string;
};

export type VehiclePayload = {
  vehicleId: string;
  soc: number;
  kwhDeliveredDc: number;
  batteryTemp: number;
  timestamp: string;
};

export type IngestTelemetryDto = MeterPayload | VehiclePayload;
