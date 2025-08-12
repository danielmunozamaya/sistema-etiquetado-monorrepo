import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuarios } from './entities/usuario.entity';
import { RolesModule } from 'src/roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { CommonModule } from 'src/common/common.module';
import { LlenadorasModule } from 'src/llenadoras/llenadoras.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, UserExistsGuard],
  imports: [
    TypeOrmModule.forFeature([Usuarios]),
    RolesModule,
    JwtModule,
    forwardRef(() => CommonModule),
    forwardRef(() => LlenadorasModule),
    forwardRef(() => SincronismoModule),
  ],
  exports: [UsuariosService, UserExistsGuard],
})
export class UsuariosModule {}
