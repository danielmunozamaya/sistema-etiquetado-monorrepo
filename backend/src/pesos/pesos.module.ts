import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PesosService } from './pesos.service';
import { PesosController } from './pesos.controller';
import { Pesos } from './entities/peso.entity';
import { ProduccionsModule } from 'src/produccion/produccion.module';
import { NumeroBidonModule } from 'src/numero_bidon/numero_bidon.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { BartenderModule } from 'src/bartender/bartender.module';

@Module({
  controllers: [PesosController],
  providers: [PesosService],
  imports: [
    TypeOrmModule.forFeature([Pesos]),
    ProduccionsModule,
    NumeroBidonModule,
    WebsocketsModule,
    forwardRef(() => UsuariosModule),
    forwardRef(() => SincronismoModule),
    BartenderModule,
  ],
  exports: [PesosService],
})
export class PesosModule {}
