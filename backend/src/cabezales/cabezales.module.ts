import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CabezalesService } from './cabezales.service';
import { CabezalesController } from './cabezales.controller';
import { Cabezales } from './entities/cabezal.entity';
import { LlenadorasModule } from 'src/llenadoras/llenadoras.module';
import { CommonModule } from 'src/common/common.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [CabezalesController],
  providers: [CabezalesService],
  imports: [
    TypeOrmModule.forFeature([Cabezales]),
    forwardRef(() => LlenadorasModule),
    forwardRef(() => CommonModule),
    forwardRef(() => SincronismoModule),
    forwardRef(() => UsuariosModule),
  ],
  exports: [CabezalesService],
})
export class CabezalesModule {}
