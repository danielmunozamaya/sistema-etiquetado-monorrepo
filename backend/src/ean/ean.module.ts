import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EanService } from './ean.service';
import { EanController } from './ean.controller';
import { Ean } from './entities/ean.entity';
import { ProductosModule } from 'src/productos/productos.module';
import { PresentacionesModule } from 'src/presentaciones/presentaciones.module';
import { CommonModule } from 'src/common/common.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [EanController],
  providers: [EanService],
  imports: [
    TypeOrmModule.forFeature([Ean]),
    ProductosModule,
    PresentacionesModule,
    forwardRef(() => CommonModule),
    forwardRef(() => SincronismoModule),
    forwardRef(() => UsuariosModule),
  ],
  exports: [EanService],
})
export class EansModule {}
