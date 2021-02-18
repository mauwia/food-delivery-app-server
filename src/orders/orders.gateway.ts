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
import { FoodCreator } from "src/food-creator/food-creator.model";
@WebSocketGateway()
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>
  ) {}
  socket_id: any;
  users: any[] = [];
  onlineUsers: { [key: string]: any } = {};
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("AppGateway");
  afterInit(server: Server) {
    this.logger.log("Init");
  }
  @SubscribeMessage("search-filter")
  async handleSearchFilter(client: Socket, payload) {
    // payload=JSON.parse(payload)
    console.log(payload)
    console.log(payload.lng);
    var searchKey = new RegExp(payload.search, "i");

    let nearByFoodCreators = await this.foodCreatorModel
      .find({
        $and: [
          {
            location: {
              $near: {
                $maxDistance: 5000,
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
                username:searchKey
              }
            ],
          },
        ],
      })
      .select("-pinHash -passHash -mobileRegisteredId -walletId -verified -fcmRegistrationToken");
      console.log(nearByFoodCreators)
      // console.log(this.onlineUsers[payload.phoneNo].socketId)
      this.server.to(this.onlineUsers[payload.phoneNo].socketId).emit("search-result",{nearByFoodCreators})
  }
  handleUpdateStatus(to: string, order: any): void {
    if (this.onlineUsers[to]) {
      console.log(this.socket_id);
      this.server
        .to(this.onlineUsers[to].socketId)
        .emit("update-order-status", order);
    }
  }
  handleAddOrder(to: string, order: any): void {
    // console.log
    if (this.onlineUsers[to]) {
      console.log(this.socket_id);
      this.server.to(this.onlineUsers[to].socketId).emit("add-order", order);
    }
  }
  handleDisconnect(client: Socket) {
    delete this.onlineUsers[client.handshake.query.userNo];
    this.logger.log(`Client disconnected: ${client.id}`);
    console.log(this.onlineUsers);
  }
  handleConnection(client: Socket, ...args: any[]) {
    let { userNo } = client.handshake.query;
    this.onlineUsers[userNo] = { phoneNo: userNo, socketId: client.id };
    console.log(this.onlineUsers);
  }
}
