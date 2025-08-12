import { Produccion } from 'src/produccion/entities/produccion.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Pesos {
  
  @Column({ type: 'varchar', length: 2 })
  id_llenadora: string;
  
  @Column({ type: 'varchar', length: 1 })
  id_cabezal_llenadora: string;
  
  @Column({ type: 'decimal', precision: 9, scale: 2 })
  peso_plc: number;
  
  @Column({ type: 'numeric', precision: 1, scale: 0 })
  orden_impresion: number;
  
  @Column({ type: 'numeric', precision: 1, scale: 0, default: 0 })
  comunicacion: number;
  
  @Column({ type: 'datetime', nullable: true, default: null })
  fecha_registro: Date;
  
  @Column({ type: 'uuid', nullable: true })
  registro_produccion: string;
  
  @OneToOne(() => Produccion)
  @JoinColumn({ name: 'registro_produccion' })
  registroProduccion: Produccion;
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

}
