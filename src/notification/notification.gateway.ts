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
import { FoodLover } from "src/foodLover/foodLover.model";
import { FoodCreator } from "src/food-creator/food-creator.model";
  
  @WebSocketGateway()
  export class NotificationGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    socket_id: any;
    users: any[] = [];
    onlineUsers: { [key: string]: any } = {};
    constructor(
        @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
        @InjectModel("FoodCreator")
        private readonly foodCreatorModel: Model<FoodCreator>
    ){}
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger("NotificationGateway");
    afterInit(server: Server) {
      this.logger.log("Init");
    }
    async updateNotificationCountToZero(to) {
      this.server
      .to(this.onlineUsers[to].socketId)
      .emit(
        "update-notification-count",
        0
      );
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
  