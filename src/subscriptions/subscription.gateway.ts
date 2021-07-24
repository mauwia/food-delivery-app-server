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
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@WebSocketGateway()
export class SubscriptionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  socket_id: any;
  users: any[] = [];
  onlineUsers: { [key: string]: any } = {};
  constructor() {}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("NotificationGateway");
  afterInit(server: Server) {
    this.logger.log("Init");
  }
  async handleSubscription(to: string, fcmRegistrationToken: any, text: any) {
    if (this.onlineUsers[to]) {
      console.log(this.socket_id);
      this.server.to(this.onlineUsers[to].socketId).emit("subscription", text);
    } else {
      await admin.messaging().sendToDevice(
        fcmRegistrationToken,
        {
          notification: {
            title: text,
            body: "Tap to view details",
            clickAction: "noshifyfoodloverfrontend://food-lover-wallet",
          },
        },
        { priority: "high" }
      );
    }
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
