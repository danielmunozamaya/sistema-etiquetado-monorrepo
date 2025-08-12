import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class UserExistsGuard implements CanActivate {
  constructor(private readonly usuariosService: UsuariosService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.uuid || !user.nombre || !user.rol) {
      throw new UnauthorizedException(
        'Token inválido o sin información de usuario'
      );
    }

    // const exists = await this.usuariosService.userExistsWithTransaction(
    //   user.uuid
    // );

    // if (!exists) {
    //   throw new UnauthorizedException('El usuario ya no existe en el sistema');
    // }

    return true;
  }
}
