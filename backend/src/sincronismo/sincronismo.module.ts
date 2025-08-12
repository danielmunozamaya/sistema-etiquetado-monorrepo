import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SincronismoService } from './sincronismo.service';
import { SincronismoController } from './sincronismo.controller';
import { Sincronismo } from './entities/sincronismo.entity';
import { AsociacionProduccionsModule } from 'src/asociacion-produccion/asociacion-produccion.module';
import { CabezalesModule } from 'src/cabezales/cabezales.module';
import { EansModule } from 'src/ean/ean.module';
import { LlenadorasModule } from 'src/llenadoras/llenadoras.module';
import { MotivoBajasModule } from 'src/motivo-bajas/motivo-bajas.module';
import { NumeroBidonModule } from 'src/numero_bidon/numero_bidon.module';
import { PresentacionesModule } from 'src/presentaciones/presentaciones.module';
import { ProduccionsModule } from 'src/produccion/produccion.module';
import { ProductosModule } from 'src/productos/productos.module';
import { RolesModule } from 'src/roles/roles.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PesosModule } from 'src/pesos/pesos.module';

@Module({
  controllers: [SincronismoController],
  providers: [SincronismoService],
  imports: [
    TypeOrmModule.forFeature([Sincronismo]),
    forwardRef(() => AsociacionProduccionsModule),
    forwardRef(() => CabezalesModule),
    forwardRef(() => EansModule),
    forwardRef(() => LlenadorasModule),
    forwardRef(() => MotivoBajasModule),
    forwardRef(() => NumeroBidonModule),
    forwardRef(() => PresentacionesModule),
    forwardRef(() => ProductosModule),
    forwardRef(() => RolesModule),
    forwardRef(() => UsuariosModule),
    forwardRef(() => ProduccionsModule),
    forwardRef(() => PesosModule),
  ],
  exports: [SincronismoService],
})
export class SincronismoModule {}
