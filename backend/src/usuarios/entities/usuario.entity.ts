import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Roles } from 'src/roles/entities/rol.entity';
import { Produccion } from 'src/produccion/entities/produccion.entity';

@Entity()
export class Usuarios {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'uuid' })
  uuid_rol: string;

  @ManyToOne(() => Roles, (r) => r.usuarios)
  @JoinColumn({ name: 'uuid_rol' })
  rol: Roles;

  @Column({ type: 'varchar', length: 50 })
  ruta_impresion_manual: string; // Nombre de la impresora que usará el usuario para el etiquetado manual y semiautomático

  @Column({ type: 'bit', default: true })
  visible: boolean;

  @OneToMany(() => Produccion, (p) => p.bajaUsuario)
  produccion: Produccion[];
}
