import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Llenadoras } from 'src/llenadoras/entities/llenadora.entity';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { Produccion } from 'src/produccion/entities/produccion.entity';

@Entity()
export class Cabezales {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 2 })
  id_llenadora: string;

  @ManyToOne(() => Llenadoras, (llenadora) => llenadora.cabezales)
  @JoinColumn({ name: 'id_llenadora', referencedColumnName: 'id_llenadora' })
  llenadora: Llenadoras;

  @Column({ type: 'varchar', length: 1 })
  id_cabezal: string;

  @Column({ type: 'varchar', length: 50 })
  nombre_cabezal: string;

  @Column({ type: 'varchar', length: 50 })
  ruta_impresion: string; // Nombre de la impresora

  @Column({ type: 'bit', default: true })
  visible: boolean;

  @OneToMany(() => AsociacionProduccion, (a) => a.cabezal)
  asociaciones: AsociacionProduccion[];

  @OneToMany(() => Produccion, (a) => a.cabezal)
  produccion: Produccion[];
}
