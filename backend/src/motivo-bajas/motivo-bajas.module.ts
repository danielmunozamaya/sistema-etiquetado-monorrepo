import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MotivoBajasService } from './motivo-bajas.service';
import { MotivoBajasController } from './motivo-bajas.controller';
import { MotivoBajas } from './entities/motivo-baja.entity';
import { CommonModule } from 'src/common/common.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [MotivoBajasController],
  providers: [MotivoBajasService],
  imports: [
    TypeOrmModule.forFeature([MotivoBajas]),
    forwardRef(() => CommonModule),
    forwardRef(() => SincronismoModule),
    forwardRef(() => UsuariosModule),
  ],
  exports: [MotivoBajasService],
})
export class MotivoBajasModule {}
