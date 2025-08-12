import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Productos } from './entities/producto.entity';
import { CommonModule } from 'src/common/common.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  imports: [
    TypeOrmModule.forFeature([Productos]),
    forwardRef(() => CommonModule),
    forwardRef(() => SincronismoModule),
    forwardRef(() => UsuariosModule),
  ],
  exports: [ProductosService],
})
export class ProductosModule {}
