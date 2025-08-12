import { Module, forwardRef } from '@nestjs/common';
import { AsociacionProduccionService } from './asociacion-produccion.service';
import { AsociacionProduccionController } from './asociacion-produccion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsociacionProduccion } from './entities/asociacion-produccion.entity';
import { LlenadorasModule } from 'src/llenadoras/llenadoras.module';
import { ProductosModule } from 'src/productos/productos.module';
import { EansModule } from 'src/ean/ean.module';
import { CommonModule } from 'src/common/common.module';
import { CabezalesModule } from 'src/cabezales/cabezales.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { BartenderModule } from 'src/bartender/bartender.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  controllers: [AsociacionProduccionController],
  providers: [AsociacionProduccionService],
  imports: [
    TypeOrmModule.forFeature([AsociacionProduccion]),
    forwardRef(() => LlenadorasModule),
    forwardRef(() => CabezalesModule),
    ProductosModule,
    EansModule,
    forwardRef(() => CommonModule),
    WebsocketsModule,
    forwardRef(() => BartenderModule),
    forwardRef(() => SincronismoModule),
    forwardRef(() => UsuariosModule),
    forwardRef(() => RolesModule),
  ],
  exports: [AsociacionProduccionService],
})
export class AsociacionProduccionsModule {}
