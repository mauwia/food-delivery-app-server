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
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as admin from "firebase-admin";
import { FoodCreator } from "src/food-creator/food-creator.model";
import { OrdersService } from "./orders.service";
import { FoodLover } from "src/foodLover/foodLover.model";
@WebSocketGateway()
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>
  ) {}
  socket_id: any;
  users: any[] = [];
  onlineUsers: { [key: string]: any } = {};
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("AppGateway");
  afterInit(server: Server) {
    this.logger.log("Init");
  }
  @SubscribeMessage("sign-in")
  signIn(client: Socket, payload): void {
    if (!this.onlineUsers[payload.phoneNo]) {
      this.onlineUsers[payload.phoneNo] = {
        phoneNo: payload.phoneNo,
        socketId: client.id,
      };
    }
    console.log(this.onlineUsers);
  }
  @SubscribeMessage("search-filter")
  async handleSearchFilter(client: Socket, payload) {
    // payload=JSON.parse(payload)
    console.log(payload);
    console.log(payload.lng);
    var searchKey = new RegExp(payload.search, "i");

    let nearByFoodCreators = await this.foodCreatorModel
      .find({
        $and: [
          {
            location: {
              $near: {
                $maxDistance: 35000,
                $geometry: {
                  type: "Point",
                  coordinates: [payload.lng, payload.lat],
                },
              },
            },
          },
          {
            menuExist: true,
          },
          {
            $or: [
              {
                businessName: searchKey,
              },
              {
                username: searchKey,
              },
              {
                phoneNo: searchKey,
              },
            ],
          },
        ],
      })
      .select(
        "-pinHash -passHash -mobileRegisteredId -walletId -verified -fcmRegistrationToken"
      );
    console.log(nearByFoodCreators);
    // console.log(this.onlineUsers[payload.phoneNo].socketId)
    this.server
      .to(this.onlineUsers[payload.phoneNo].socketId)
      .emit("search-result", { nearByFoodCreators });
  }
  async handleUpdateStatus(
    to: string,
    order: any,
    fcmRegistrationToken: any,notification
  ): Promise<void> {
    await this.updateNotification(to,fcmRegistrationToken,notification)
    await this.updateNotificationCount(to,fcmRegistrationToken);
    if (this.onlineUsers[to]) {
      this.server
        .to(this.onlineUsers[to].socketId)
        .emit("update-order-status", order);
    } else {
      let text=`Order ${order.orderStatus}`
      if(order.orderStatus=="New") text="Hey! You just got a new order 😃"
      if(order.orderStatus=="Cancel") text="Customer just declined the order 😞"
      if(order.orderStatus=="Order Completed") text="Customer has marked this order as completed 😃"
      if(order.orderStatus=="Decline") text="Order Declined"
      console.log(text)
      await admin.messaging().sendToDevice(
        fcmRegistrationToken,
        {
          notification: {
            title: text,
            body: "Tap to view details",
            clickAction: "noshifyfoodloverfrontend://food-lover-wallet",
          },
          data: {
            type: "update-order-status",
            updatedOrder: JSON.stringify(order),
          },
        },
        { priority: "high" }
      );
    }
  }
  @SubscribeMessage("logout")
  logout(client: Socket, payload): void {
    delete this.onlineUsers[client.handshake.query.userNo];
    console.log(this.onlineUsers);
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
  async handleAddOrder(
    to: string,
    order: any,
    fcmRegistrationToken: any,notification
  ): Promise<void> {
    // console.log
    await this.updateNotification(to,fcmRegistrationToken,notification)
    await this.updateNotificationCount(to,fcmRegistrationToken);
    if (this.onlineUsers[to]) {
      console.log(this.socket_id);
      this.server.to(this.onlineUsers[to].socketId).emit("add-order", order);
    } else {
      await admin.messaging().sendToDevice(
        fcmRegistrationToken,
        {
          notification: {
            title: `Hey! You just got a new order 😃`,
            body: "Tap to view details",
          },
          data: {
            type: "add-order",
            orderCreated: JSON.stringify(order),
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
    let { userNo } = client.handshake.query;
    this.onlineUsers[userNo] = { phoneNo: userNo, socketId: client.id };
    console.log(this.onlineUsers);
  }
  async updateNotificationCount(to,fcmRegistrationToken) {
    try {
      let updatedNotification = await this.foodCreatorModel.findOneAndUpdate(
        { phoneNo: to },
        {
          $inc: { unseenNotification: 1 },
        },{new:true}
      );
      if (!updatedNotification) {
        updatedNotification = await this.foodLoverModel.findOneAndUpdate(
          { phoneNo: to },
          {
            $inc: { unseenNotification: 1 },
          },{new:true}
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
      }else {
        await admin.messaging().sendToDevice(
          fcmRegistrationToken,
          {
            data: {
              type: "update-notification-count",
              unseenNotification: JSON.stringify(updatedNotification.unseenNotification),
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
