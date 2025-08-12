import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Ean } from 'src/ean/entities/ean.entity';

@Entity()
export class Presentaciones {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  id_presentacion: string;

  @Column({ type: 'varchar', length: 200 })
  nombre_presentacion: string;

  @Column({ type: 'decimal', precision: 7, scale: 2 })
  peso_neto: number;

  @Column({ type: 'decimal', precision: 7, scale: 2 })
  peso_bruto: number;

  @Column({ type: 'bit', default: true })
  visible: boolean;

  @OneToOne(() => Ean, (ean) => ean.presentacion)
  ean: Ean;
}
