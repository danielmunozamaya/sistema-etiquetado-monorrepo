import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BartenderService } from './bartender.service';
import { BartenderController } from './bartender.controller';
import { AsociacionProduccionsModule } from 'src/asociacion-produccion/asociacion-produccion.module';
import { BartenderConfig } from './entities/bartender-config.entity';
import { ProductosModule } from 'src/productos/productos.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [BartenderController],
  providers: [BartenderService],
  imports: [
    TypeOrmModule.forFeature([BartenderConfig]),
    forwardRef(() => AsociacionProduccionsModule),
    forwardRef(() => ProductosModule),
    forwardRef(() => UsuariosModule),
  ],
  exports: [BartenderService],
})
export class BartenderModule {}
