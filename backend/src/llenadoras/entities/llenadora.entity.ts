import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { Cabezales } from 'src/cabezales/entities/cabezal.entity';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { Produccion } from 'src/produccion/entities/produccion.entity';

@Entity()
export class Llenadoras {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 2, unique: true })
  id_llenadora: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre_llenadora: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'bit', default: false })
  etiquetado_auto: boolean;

  @Column({ type: 'bit', default: true })
  visible: boolean;

  @OneToMany(() => Cabezales, (cabezal) => cabezal.llenadora)
  cabezales: Cabezales[];

  @OneToMany(() => AsociacionProduccion, (a) => a.llenadora)
  asociaciones: AsociacionProduccion[];

  @OneToMany(() => Produccion, (a) => a.llenadora)
  produccion: Produccion[];
}
