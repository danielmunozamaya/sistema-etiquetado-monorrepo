import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BartenderConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  protocolo_api: string;

  @Column({ type: 'varchar', length: 100 })
  host: string;

  @Column({ type: 'varchar', length: 10 })
  puerto: string;

  @Column({ type: 'varchar', length: 150 })
  ruta_api: string;

  @Column({ type: 'varchar', length: 150 })
  nombre_integracion: string;

  @Column({ type: 'varchar', length: 50 })
  comando: string;
}
