import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Llenadoras } from 'src/llenadoras/entities/llenadora.entity';
import { Productos } from 'src/productos/entities/producto.entity';
import { Ean } from 'src/ean/entities/ean.entity';
import { Cabezales } from 'src/cabezales/entities/cabezal.entity';

@Entity()
export class AsociacionProduccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 2 })
  id_llenadora: string;

  @ManyToOne(() => Llenadoras, (llenadora) => llenadora.asociaciones)
  @JoinColumn({ name: 'id_llenadora', referencedColumnName: 'id_llenadora' })
  llenadora: Llenadoras;

  @Column({ type: 'varchar', length: 1 })
  id_cabezal_llenadora: string;

  @Column({ type: 'uuid' })
  uuid_cabezal: string;

  @ManyToOne(() => Cabezales, (c) => c.asociaciones)
  @JoinColumn({ name: 'uuid_cabezal' })
  cabezal: Cabezales;

  @Column({ type: 'varchar', length: 30, nullable: true })
  familia_producto: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  id_producto: string | null;

  @ManyToOne(() => Productos, (p) => p.asociaciones)
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
  producto: Productos;

  @Column({ type: 'varchar', length: 30, nullable: true })
  codigo_ean: string | null;

  @ManyToOne(() => Ean, (e) => e.asociaciones)
  @JoinColumn({ name: 'codigo_ean', referencedColumnName: 'codigo_ean' })
  ean: Ean;

  @Column({ type: 'numeric', precision: 3, scale: 0, default: 3 })
  limite_llenado: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ruta_etiqueta: string | null;
}
