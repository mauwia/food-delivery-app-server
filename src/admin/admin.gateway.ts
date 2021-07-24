import { MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from "socket.io";

@WebSocketGateway({ transports: ['websocket']})
export class AdminGateway {
  @WebSocketServer() server: Server;

  handleFCSignup(@MessageBody() payload: unknown ) {
    this.server.emit('fcSignupToClient', payload)
  }
}
