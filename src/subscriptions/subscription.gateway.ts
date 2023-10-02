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
import { FoodCreator } from "src/food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";

@WebSocketGateway()
export class SubscriptionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  socket_id: any;
  users: any[] = [];
  onlineUsers: { [key: string]: any } = {};
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("NotificationGateway");
  constructor(
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>
  ) {}
  afterInit(server: Server) {
    this.logger.log("Init");
  }
  async updateNotification(
    to: string,
    fcmRegistrationToken: any,
    notification
  ) {
    if (this.onlineUsers[to]) {
      console.log(this.socket_id);
      this.server
        .to(this.onlineUsers[to].socketId)
        .emit("update-notification", notification);
    } else {
      await admin.messaging().sendToDevice(
        fcmRegistrationToken,
        {
          data: {
            type: "update-notification",
            unseenNotification: JSON.stringify(notification),
          },
        },
        { priority: "high" }
      );
    }
  }
  async handleSubscription(
    to: string,
    fcmRegistrationToken: any,
    text: any,
    notification
  ) {
    this.updateNotification(to,fcmRegistrationToken,notification)
    this.updateNotificationCount(to, fcmRegistrationToken);
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
  async updateNotificationCount(to, fcmRegistrationToken) {
    try {
      let updatedNotification = await this.foodCreatorModel.findOneAndUpdate(
        { phoneNo: to },
        {
          $inc: { unseenNotification: 1 },
        },
        { new: true }
      );
      if (!updatedNotification) {
        updatedNotification = await this.foodLoverModel.findOneAndUpdate(
          { phoneNo: to },
          {
            $inc: { unseenNotification: 1 },
          },
          { new: true }
        );
      }
      if (this.onlineUsers[to]) {
        console.log(this.socket_id);
        this.server
          .to(this.onlineUsers[to].socketId)
          .emit(
            "update-notification-count",
            updatedNotification.unseenNotification
          );
      } else {
        await admin.messaging().sendToDevice(
          fcmRegistrationToken,
          {
            data: {
              type: "update-notification-count",
              unseenNotification: JSON.stringify(
                updatedNotification.unseenNotification
              ),
            },
          },
          { priority: "high" }
        );
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      return error;
    }
  }
}
