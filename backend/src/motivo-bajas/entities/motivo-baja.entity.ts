import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Produccion } from 'src/produccion/entities/produccion.entity';

@Entity()
export class MotivoBajas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 5, unique: true })
  codigo_baja: string;

  @Column({ type: 'varchar', length: 200 })
  nombre_baja: string;

  @Column({ type: 'text', nullable: true, default: null })
  descripcion_baja: string;

  @Column({ type: 'bit', default: true })
  visible: boolean;

  @OneToMany(() => Produccion, (a) => a.motivoBaja)
  produccion: Produccion[];
}
