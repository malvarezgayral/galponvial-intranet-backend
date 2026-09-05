// src/service/entities/service.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('service')
export class Service {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  vehiculo!: string;

  @Column({ type: 'date', nullable: true })
  fecha!: string;

  @Column({ name: 'aceite_motor', type: 'varchar', length: 10, nullable: true })
  aceiteMotor!: string;

  @Column({ name: 'aceite_caja', type: 'varchar', length: 10, nullable: true })
  aceiteCaja!: string;

  @Column({ name: 'aceite_diferencial', type: 'varchar', length: 10, nullable: true })
  aceiteDiferencial!: string;

  @Column({ name: 'aceite_transmision', type: 'varchar', length: 10, nullable: true })
  aceiteTransmision!: string;

  @Column({ name: 'filtro_transmision', type: 'varchar', length: 10, nullable: true })
  filtroTransmision!: string;

  @Column({ name: 'filtro_motor_aceite', type: 'varchar', length: 10, nullable: true })
  filtroMotorAceite!: string;

  @Column({ name: 'filtro_aire', type: 'varchar', length: 10, nullable: true })
  filtroAire!: string;

  @Column({ name: 'filtro_gasoil', type: 'varchar', length: 10, nullable: true })
  filtroGasoil!: string;

  @Column({ name: 'aceite_hidraulico', type: 'varchar', length: 10, nullable: true })
  aceiteHidraulico!: string;

  @Column({ name: 'filtro_hidraulico', type: 'varchar', length: 10, nullable: true })
  filtroHidraulico!: string;

  @Column({ name: 'correas_auxiliares', type: 'varchar', length: 10, nullable: true })
  correasAuxiliares!: string;

  @Column({ name: 'aceite_tande', type: 'varchar', length: 10, nullable: true })
  aceiteTande!: string;

  @Column({ name: 'regulacion_valvulas', type: 'varchar', length: 10, nullable: true })
  regulacionValvulas!: string;

  @Column({ name: 'cambio_damper', type: 'varchar', length: 10, nullable: true })
  cambioDamper!: string;

  @Column({ name: 'proximo_service', type: 'date', nullable: true })
  proximoService!: string;

  @Column({ name: 'cuenta_hora', type: 'varchar', length: 50, nullable: true })
  cuentaHora!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  stock!: string;

  @Column({ type: 'text', nullable: true })
  observaciones!: string;
}