import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { WsCustomEvent } from './types/websockets-events.types';

@WebSocketGateway({ cors: true })
@Injectable()
export class WebsocketsGateway {
  @WebSocketServer()
  server: Server;

  emitCustomEvent(event: WsCustomEvent) {
    this.server.emit(event.type, event.payload);
  }
}
