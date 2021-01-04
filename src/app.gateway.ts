import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
 } from '@nestjs/websockets';
 import { Logger } from '@nestjs/common';
 import { Socket, Server } from 'socket.io';
 @WebSocketGateway()
 export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  socket_id: any;
  users: any[] = [];
  onlineUsers: { [key: string]: any } = {};
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  handleMessage(to: string, transaction: any): void {
  //  this.server.emit(payload.phoneNo, payload);
  this.server
      .to(this.onlineUsers[to].socketId)
      .emit('recieve-transaction', transaction);
  }
  @SubscribeMessage('user-online')
  setUserOnline(client: Socket, payload: string): void {
    const data = JSON.parse(payload);
    this.onlineUsers[data.phoneNo] = { ...data, socketId: this.socket_id };
    console.log(this.onlineUsers)
    // client.emit('online-users', this.onlineUsers);
  }
  afterInit(server: Server) {
   this.logger.log('Init');
  }
  handleDisconnect(client: Socket) {
   this.logger.log(`Client disconnected: ${client.id}`);
  
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.socket_id = client.id;
   this.logger.log(`Client connected: ${client.id}`);
   this.server
      .to(client.id)
      .emit('newClientId',client.id);   
  }
 }