import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LlenadorasService } from './llenadoras.service';
import { LlenadorasController } from './llenadoras.controller';
import { Llenadoras } from './entities/llenadora.entity';
import { CommonModule } from 'src/common/common.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { CabezalesModule } from '../cabezales/cabezales.module';
import { AsociacionProduccionsModule } from 'src/asociacion-produccion/asociacion-produccion.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [LlenadorasController],
  providers: [LlenadorasService],
  imports: [
    TypeOrmModule.forFeature([Llenadoras]),
    forwardRef(() => CommonModule),
    forwardRef(() => SincronismoModule),
    CabezalesModule,
    forwardRef(() => AsociacionProduccionsModule),
    forwardRef(() => UsuariosModule),
  ],
  exports: [LlenadorasService],
})
export class LlenadorasModule {}
