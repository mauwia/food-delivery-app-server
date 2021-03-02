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
import * as admin from "firebase-admin";

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  socket_id: any;
  users: any[] = [];
  onlineUsers: { [key: string]: any } = {};
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("AppGateway");

  handleReceiveTransaction(to: string, transaction: any): void {
    //  this.server.emit(payload.phoneNo, payload);
    // console.log(to,transaction)
    if (this.onlineUsers[to]) {
      this.server
        .to(this.onlineUsers[to].socketId)
        .emit("receive-transaction", transaction);
    }
  }
  @SubscribeMessage("logout")
  logout(client: Socket, payload): void {
    delete this.onlineUsers[client.handshake.query.userNo];
  }
  @SubscribeMessage("sign-in")
  signIn(client:Socket, payload):void{
    if(!this.onlineUsers[payload.phoneNo]){
    this.onlineUsers[payload.phoneNo] = { phoneNo: payload.phoneNo, socketId: client.id };
    }
  }
  async handleRequestNoshies(to: string, transaction: any,noticationData:any): Promise<void> {
    if (this.onlineUsers[to]) {
      this.server
        .to(this.onlineUsers[to].socketId)
        .emit("noshies-request", transaction);
    }
    else{
      await admin
        .messaging()
        .sendToDevice(noticationData.requestReceiverfcmRegistrationToken, {
          notification: {
            title: `${noticationData.senderUsername} Requested You ${noticationData.amount} Noshies`,
            body: "Tap to view details",
          },
        });
    } 
  }
  async handleApproveRequestNoshies(to: string, transaction: any,notificationData:any): Promise<void> {
    if (this.onlineUsers[to]) {
      this.server
        .to(this.onlineUsers[to].socketId)
        .emit("approve-noshies-request", transaction);
    }else{
      await admin
      .messaging()
      .sendToDevice(notificationData.pendingNoshRequestFCM, {
        notification: {
          title: `${notificationData.senderUsername} Approved Your ${notificationData.amount} Noshies`,
          body: "Tap to view details",
        },
      });
    }
  }
  async handlesendNoshies(to: string, transaction: any,notificationData:any): Promise<void> {
    if (this.onlineUsers[to]) {
      console.log(this.socket_id);
      this.server
        .to(this.onlineUsers[to].socketId)
        .emit("send-noshies", transaction);
    }
    else{
      await admin.messaging().sendToDevice(notificationData.ReceiverfcmRegistrationToken, {
        notification: {
          title: `${notificationData.senderUsername} Gifted You ${notificationData.amount} Noshies`,
          body: "Tap to view details",
        },
      },{priority:"high"})
    }
  }

  afterInit(server: Server) {
    this.logger.log("Init");
  }

  handleDisconnect(client: Socket) {
    if (this.onlineUsers[client.handshake.query.userNo]) {
      delete this.onlineUsers[client.handshake.query.userNo];
    }
    this.logger.log(`Client disconnected: ${client.id}`);
    console.log(this.onlineUsers);
  }
  handleConnection(client: Socket, ...args: any[]) {
    console.log(client.handshake.query.userNo);
    let { userNo } = client.handshake.query;
    this.onlineUsers[userNo] = { phoneNo: userNo, socketId: client.id };
    console.log(this.onlineUsers);
  }
}
