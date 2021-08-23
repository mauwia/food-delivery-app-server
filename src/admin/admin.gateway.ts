import { MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from "socket.io";

@WebSocketGateway({ transports: ['websocket']})
export class AdminGateway {
  @WebSocketServer() server: Server;

  handleFCSignup(@MessageBody() payload: unknown ) {
    this.server.emit('fcSignupToClient', payload)
  }

  handleNewOrder(@MessageBody() payload: unknown ) {
    this.server.emit('newOrderToClient', payload)
  }

  handleNewChat(@MessageBody() payload: unknown) {
    this.server.emit('newChatFromServer', payload)
  }

  handleAdminNotification(@MessageBody() payload: unknown) {
    this.server.emit('newNotification', payload)
  }

  handleOrderStatusUpdate(@MessageBody() payload: unknown) {
    this.server.emit('updatedOrderStatus', payload)
  }
}
