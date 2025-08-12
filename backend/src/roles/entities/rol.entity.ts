import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { Usuarios } from 'src/usuarios/entities/usuario.entity';
import {
  LlenadorasPermitidas,
  LlenadorasPermitidasCabecera,
} from 'src/common/types/roles.types';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  rol: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: LlenadorasPermitidasCabecera.NINGUNA,
  })
  llenadoras_permitidas: LlenadorasPermitidas;

  @OneToMany(() => Usuarios, (u) => u.rol)
  usuarios: Usuarios[];
}
