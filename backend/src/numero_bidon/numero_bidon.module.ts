import { forwardRef, Module } from '@nestjs/common';
import { NumeroBidonService } from './numero_bidon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NumeroBidon } from './entities/numero_bidon.entity';
import { NumeroBidonController } from './numero_bidon.controller';
import { CommonModule } from 'src/common/common.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { LlenadorasModule } from 'src/llenadoras/llenadoras.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [NumeroBidonController],
  providers: [NumeroBidonService],
  imports: [
    TypeOrmModule.forFeature([NumeroBidon]),
    forwardRef(() => CommonModule),
    WebsocketsModule,
    forwardRef(() => LlenadorasModule),
    forwardRef(() => SincronismoModule),
    forwardRef(() => UsuariosModule),
  ],
  exports: [NumeroBidonService],
})
export class NumeroBidonModule {}
