import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { SincronismoModule } from 'src/sincronismo/sincronismo.module';
import { SyncGuard } from './guards/sync.guard';

@Module({
  controllers: [CommonController],
  imports: [UsuariosModule, SincronismoModule],
  providers: [JwtStrategy, SyncGuard],
  exports: [SyncGuard],
})
export class CommonModule {}
