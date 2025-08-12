import { Injectable, Logger } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';
import { WsCustomEvent } from './types/websockets-events.types';

@Injectable()
export class WebsocketsService {
  private readonly logger = new Logger(WebsocketsService.name);

  constructor(private readonly gateway: WebsocketsGateway) {}

  emitWsEvent(event: WsCustomEvent) {
    try {
      this.gateway.emitCustomEvent(event);
    } catch (error) {
      this.logger.error(
        `Error al emitir el Websocket event ${event.payload.method} al servicio ${event.type}`
      );
    }
  }
}
