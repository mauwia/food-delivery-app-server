import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from "@nestjs/websockets";
  import { Logger } from "@nestjs/common";
  import { Socket, Server } from "socket.io";
  @WebSocketGateway()
  export class OrdersGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    socket_id: any;
    users: any[] = [];
    onlineUsers: { [key: string]: any } = {};
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger("AppGateway");
    afterInit(server: Server) {
      this.logger.log("Init");
    }
    handleUpdateStatus(to: string, order: any): void {

      if (this.onlineUsers[to]) {
        console.log(this.socket_id)
        this.server
          .to(this.onlineUsers[to].socketId)
          .emit("update-order-status", order);
      }
    }
    handleAddOrder(to:string,order:any):void {
      if (this.onlineUsers[to]) {
        console.log(this.socket_id)
        this.server
          .to(this.onlineUsers[to].socketId)
          .emit("add-order", order);
      }
    }
    handleDisconnect(client: Socket) {
      delete this.onlineUsers[client.handshake.query.userNo]
      this.logger.log(`Client disconnected: ${client.id}`);
      console.log(this.onlineUsers);
    }
    handleConnection(client: Socket, ...args: any[]) {
    let {userNo}=client.handshake.query
    this.onlineUsers[userNo] = { phoneNo:userNo, socketId: client.id };
    console.log(this.onlineUsers);
    }
  }
  