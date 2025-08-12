import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { SyncState } from 'src/common/enums/sync.enums';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';

@Entity()
export class Sincronismo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  operacion: SyncOperacion;

  @Column({ type: 'varchar', length: 40 })
  tabla: SyncTabla;

  @Column('text')
  registro: string;

  @Column({ type: 'datetime' })
  fecha: Date;

  @Column({
    type: 'varchar',
    length: 15,
    default: SyncState.PENDING,
  })
  estado: SyncState;

  @Column({ type: 'decimal', precision: 1, scale: 0, default: 0 })
  intentos: number;
}
