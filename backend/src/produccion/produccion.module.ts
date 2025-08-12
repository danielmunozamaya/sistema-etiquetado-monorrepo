import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProduccionService } from './produccion.service';
import { ProduccionController } from './produccion.controller';
import { Produccion } from './entities/produccion.entity';
import { LlenadorasModule } from 'src/llenadoras/llenadoras.module';
import { AsociacionProduccionsModule } from 'src/asociacion-produccion/asociacion-produccion.module';
import { EansModule } from 'src/ean/ean.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { MotivoBajasModule } from 'src/motivo-bajas/motivo-bajas.module';
import { NumeroBidonModule } from 'src/numero_bidon/numero_bidon.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { CommonModule } from 'src/common/common.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { BartenderModule } from 'src/bartender/bartender.module';

@Module({
  controllers: [ProduccionController],
  providers: [ProduccionService],
  imports: [
    TypeOrmModule.forFeature([Produccion]),
    forwardRef(() => LlenadorasModule),
    forwardRef(() => AsociacionProduccionsModule),
    forwardRef(() => EansModule),
    forwardRef(() => UsuariosModule),
    forwardRef(() => MotivoBajasModule),
    forwardRef(() => NumeroBidonModule),
    forwardRef(() => SincronismoModule),
    forwardRef(() => CommonModule),
    forwardRef(() => WebsocketsModule),
    forwardRef(() => BartenderModule),
  ],
  exports: [ProduccionService],
})
export class ProduccionsModule {}
