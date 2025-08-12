import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NumeroBidon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 2 })
  id_llenadora: string;

  @Column({ type: 'varchar', length: 1 })
  id_cabezal_llenadora: string;

  @Column({ type: 'numeric', precision: 10, scale: 0, default: 1 })
  numero_bidon: number;

  @Column({ type: 'numeric', precision: 4, scale: 0 })
  anio: number;

  @Column({ type: 'numeric', precision: 1, scale: 0, default: 0 })
  registro_bloqueado: number;
}
