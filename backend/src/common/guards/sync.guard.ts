import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';

@Injectable()
export class SyncGuard implements CanActivate {
  constructor(private readonly sincronismoService: SincronismoService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // throw new ServiceUnavailableException(
    //   'El backend no puede procesar la petición porque la base de datos está sincronizando datos.'
    // );
    // const isSyncing = await this.sincronismoService.areThereDataToSynchronize();
    const request = context.switchToHttp().getRequest();

    if (
      request.method === 'GET' &&
      request.originalUrl === '/api/common/heartbit'
    ) {
      return true;
    }

    if (this.sincronismoService.areThereDataToSynchronize()) {
      throw new ServiceUnavailableException(
        'El backend no puede procesar la petición porque la base de datos está sincronizando datos. Por favor, recargue en unos instantes...'
      );
    }
    return true;
  }
}
