import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Ean } from 'src/ean/entities/ean.entity';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { Produccion } from 'src/produccion/entities/produccion.entity';

@Entity()
export class Productos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  id_producto: string;

  @Column({ type: 'varchar', length: 200 })
  nombre_producto: string;

  @Column({ type: 'varchar', length: 200 })
  familia_producto: string;

  @Column({ type: 'bit', default: true })
  visible: boolean;

  @OneToMany(() => Ean, (ean) => ean.producto)
  eans: Ean[];

  @OneToMany(() => AsociacionProduccion, (a) => a.producto)
  asociaciones: AsociacionProduccion[];

  @OneToMany(() => Produccion, (a) => a.producto)
  produccion: Produccion[];
}
