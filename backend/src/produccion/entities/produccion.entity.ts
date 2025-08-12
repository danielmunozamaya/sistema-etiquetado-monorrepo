import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Llenadoras } from 'src/llenadoras/entities/llenadora.entity';
import { Cabezales } from 'src/cabezales/entities/cabezal.entity';
import { Productos } from 'src/productos/entities/producto.entity';
import { Ean } from 'src/ean/entities/ean.entity';
import { MotivoBajas } from 'src/motivo-bajas/entities/motivo-baja.entity';
import { Usuarios } from 'src/usuarios/entities/usuario.entity';
import { TipoEtiqueta } from 'src/bartender/types/tipo_etiqueta.type';

@Entity()
export class Produccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 1, scale: 0 })
  tipo_etiqueta: TipoEtiqueta; // 1 = AUTOMÁTICA; 2 = SEMIAUTOMÁTICA; 3 = MANUAL

  @Column({ type: 'numeric', precision: 10, scale: 0 })
  no_bidon: number;

  @Column({ type: 'numeric', precision: 1, scale: 0 })
  digito_control: number;

  @Column({ type: 'varchar', length: 18 })
  no_matricula: string;

  @Column({ type: 'varchar', length: 9 })
  no_lote: string;

  @Column({ type: 'text', nullable: true })
  sscc: string;

  @Column({ type: 'varchar', length: 2 })
  id_llenadora: string;

  @ManyToOne(() => Llenadoras)
  @JoinColumn({ name: 'id_llenadora', referencedColumnName: 'id_llenadora' })
  llenadora: Llenadoras;

  @Column({ type: 'varchar', length: 1 })
  id_cabezal_llenadora: string;

  @Column({ type: 'uuid' })
  uuid_cabezal: string;

  @ManyToOne(() => Cabezales)
  @JoinColumn({ name: 'uuid_cabezal' })
  cabezal: Cabezales;

  @Column({ type: 'varchar', length: 30 })
  familia_producto: string;

  @Column({ type: 'varchar', length: 30 })
  id_producto: string;

  @ManyToOne(() => Productos)
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
  producto: Productos;

  @Column({ type: 'varchar', length: 30 })
  codigo_ean: string;

  @ManyToOne(() => Ean)
  @JoinColumn({ name: 'codigo_ean', referencedColumnName: 'codigo_ean' })
  ean: Ean;

  @Column({ type: 'date' })
  fecha_produccion: string;

  @Column({ type: 'time' })
  hora_produccion: string;

  @Column({ type: 'date' })
  fecha_caducidad: string;

  @Column({ type: 'numeric', precision: 3, scale: 0 })
  code: number;

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  peso_neto_real: number;

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  peso_neto_etiqueta: number;

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  peso_bruto_etiqueta: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  titulo_1: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  valor_1: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  titulo_2: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  valor_2: string;

  @Column({ type: 'numeric', precision: 1, scale: 0, default: 1 })
  estado: number;

  @Column({ type: 'uuid', nullable: true })
  motivo_baja: string;

  @ManyToOne(() => MotivoBajas)
  @JoinColumn({ name: 'motivo_baja' })
  motivoBaja: MotivoBajas;

  @Column({ type: 'datetime', nullable: true })
  baja_fecha: Date;

  @Column({ type: 'uuid', nullable: true })
  baja_usuario: string;

  @ManyToOne(() => Usuarios)
  @JoinColumn({ name: 'baja_usuario' })
  bajaUsuario: Usuarios;

  @Column({ type: 'numeric', precision: 1, scale: 0, default: 0 })
  registrado: number;

  @Column({ type: 'datetime', nullable: true })
  registrado_fecha: Date;
}
