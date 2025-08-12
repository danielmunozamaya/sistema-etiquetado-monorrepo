import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
// import { LlenadorasModule } from 'src/llenadoras/llenadoras.module';
// import { CabezalesModule } from 'src/cabezales/cabezales.module';
// import { ProductosModule } from 'src/productos/productos.module';
// import { PresentacionesModule } from 'src/presentaciones/presentaciones.module';
// import { EansModule } from 'src/ean/ean.module';
// import { MotivoBajasModule } from 'src/motivo-bajas/motivo-bajas.module';
// import { RolesModule } from 'src/roles/roles.module';
// import { AsociacionProduccionsModule } from 'src/asociacion-produccion/asociacion-produccion.module';
// import { UsuariosModule } from 'src/usuarios/usuarios.module';
// import { PesosModule } from 'src/pesos/pesos.module';
// import { ProduccionsModule } from 'src/produccion/produccion.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    // LlenadorasModule,
    // CabezalesModule,
    // ProductosModule,
    // PresentacionesModule,
    // EansModule,
    // MotivoBajasModule,
    // RolesModule,
    // AsociacionProduccionsModule,
    // UsuariosModule,
    // PesosModule,
    // ProduccionsModule,
  ],
})
export class SeedModule {}
