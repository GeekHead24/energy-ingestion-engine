import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['meterId', 'timestamp'])
export class MeterTelemetry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  meterId: string;

  @Column('float')
  kwhConsumedAc: number;

  @Column('float')
  voltage: number;

  @Column()
  timestamp: Date;
}
