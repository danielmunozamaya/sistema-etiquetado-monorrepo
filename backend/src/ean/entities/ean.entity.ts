import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { Productos } from 'src/productos/entities/producto.entity';
import { Presentaciones } from 'src/presentaciones/entities/presentacion.entity';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { Produccion } from 'src/produccion/entities/produccion.entity';

@Entity()
export class Ean {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  codigo_ean: string;

  @Column({ type: 'varchar', length: 30 })
  id_producto: string;

  @ManyToOne(() => Productos, (producto) => producto.eans)
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
  producto: Productos;

  @Column({ type: 'varchar', length: 15 })
  id_presentacion: string;

  @OneToOne(() => Presentaciones, (presentacion) => presentacion.ean)
  @JoinColumn({
    name: 'id_presentacion',
    referencedColumnName: 'id_presentacion',
  })
  presentacion: Presentaciones;

  @Column({ type: 'numeric', precision: 5, scale: 0 })
  dias_best_before: number;

  @Column({ type: 'bit', default: true })
  visible: boolean;

  @OneToMany(() => AsociacionProduccion, (a) => a.ean)
  asociaciones: AsociacionProduccion[];

  @OneToMany(() => Produccion, (a) => a.ean)
  produccion: Produccion[];
}
