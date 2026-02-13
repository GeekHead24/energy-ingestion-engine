import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity()
export class MeterStatus {
  @PrimaryColumn()
  meterId: string;

  @Column('float')
  kwhConsumedAc: number;

  @Column('float')
  voltage: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
