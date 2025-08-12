import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PresentacionesService } from './presentaciones.service';
import { PresentacionesController } from './presentaciones.controller';
import { Presentaciones } from './entities/presentacion.entity';
import { CommonModule } from 'src/common/common.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [PresentacionesController],
  providers: [PresentacionesService],
  imports: [
    TypeOrmModule.forFeature([Presentaciones]),
    forwardRef(() => CommonModule),
    forwardRef(() => SincronismoModule),
    forwardRef(() => UsuariosModule),
  ],
  exports: [PresentacionesService],
})
export class PresentacionesModule {}
