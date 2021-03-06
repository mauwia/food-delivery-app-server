import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Wallet } from "../wallet/wallet.model";
// import { WalletModule } from "src/wallet/wallet.module";
import { WalletService } from "../wallet/wallet.service";
import { FoodCreator } from "../food-creator/food-creator.model";
import { FoodLover } from "../foodLover/foodLover.model";
import { pad } from "../utils";
import { OrdersGateway } from "./orders.gateway";
import { Orders } from "./orders.model";
import { ChatService } from "../chat/chat.service";
import { MenuItems } from "../menu/menu.model";
import { Types } from "mongoose";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("MenuItems") private readonly menuItemsModel: Model<MenuItems>,
    @InjectModel("Wallet") private readonly walletModel: Model<Wallet>,
    private readonly walletService: WalletService,
    private readonly ordersGateway: OrdersGateway,
    private readonly chatService: ChatService
  ) {}
  private logger = new Logger("Wallet");
  async createOrder(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let { body } = req;
      let createdOrders = [];
      // let createdOrders = await Promise.all(body.orders.map(order => {
      //   return this.addOrders(order);
      // }));
      // console.log('Promise One',createdOrders)
      console.log("body", body.orders);
      for (let i = 0; i < body.orders.length; i++) {
        let ordercreate = await this.addOrders(body.orders[i], UserInfo);
        createdOrders.push(ordercreate);
      }
      console.log(createdOrders);
      return { orders: createdOrders };
    } catch (error) {
      this.logger.error(error, error.stack);
      console.log("errorQQ", error);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  async addOrders(order, UserInfo) {
    try {
      let foodCreator = await this.foodCreatorModel.findOne({
        _id: order.foodCreatorId,
      });
      let incrementOrder = +foodCreator.totalOrders + 1;
      foodCreator.totalOrders = pad(
        incrementOrder,
        foodCreator.totalOrders.length
      );
      await foodCreator.save();
      order.realOrderBill = order.orderedFood.reduce((init, food) => {
        return food.realPrice * food.quantity + init;
      }, 0);
      console.log(order.orderedFood);
      order.NoshDeduct = order.orderBill - order.realOrderBill;
      // order.orderBill -= order.NoshDeduct;
      let newOrder = new this.ordersModel(order);
      newOrder.orderId =
        "#" + pad(incrementOrder, foodCreator.totalOrders.length);
      let orderCreated = await this.ordersModel.create(newOrder);
      orderCreated = await orderCreated
        .populate([
          {
            path: "foodLoverId",
            select: "username",
          },
          {
            path: "foodCreatorId",
            select: "businessName",
          },
        ])
        .execPopulate();
      // console.log()
      this.ordersGateway.handleAddOrder(
        foodCreator.phoneNo,
        orderCreated,
        foodCreator.fcmRegistrationToken
      );
      return orderCreated;
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          msg: error,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async getOrders(req) {
    try {
      let { user } = req;
      let getOrdersReciever = "foodLoverId";
      let name = "username";
      let UserInfo: any = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodLoverModel.findOne({
          phoneNo: user.phoneNo,
        });
        getOrdersReciever = "foodCreatorId";
        name = "businessName";
      }
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let Orders = await this.ordersModel
        .find({
          $and: [
            // { foodCreatorId: UserInfo._id },
            {
              $or: [
                { foodLoverId: UserInfo._id },
                { foodCreatorId: UserInfo._id },
              ],
            },
            { orderStatus: { $nin: ["Decline", "Order Completed", "Cancel"] } },
          ],
        })
        .populate([
          {
            path: "foodLoverId",
            select: "username isActive phoneNo imageUrl",
          },
          {
            path: "foodCreatorId",
            select: "businessName imageUrl",
          },
          {
            path: "chatRoomId",
          },
        ]);
      return { Orders };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async updateOrderStatus(req) {
    try {
      let { user } = req;
      let orderStatusReciever = "foodLoverId";
      let name = "username";

      let UserInfo: any = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodLoverModel.findOne({
          phoneNo: user.phoneNo,
        });
        orderStatusReciever = "foodCreatorId";
        name = "businessName";
      }
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let { orderID, status,reason } = req.body;
      let order = await this.ordersModel.findById(orderID).populate([
        {
          path: "foodLoverId",
          select: "username phoneNo fcmRegistrationToken walletId imageUrl",
        },
        {
          path: "foodCreatorId",
          select: "businessName phoneNo fcmRegistrationToken walletId imageUrl",
        },
      ]);
      if (status === "Accepted") {
        let chatroom = await this.chatService.createChatroom({
          foodCreatorId: order.foodCreatorId._id,
          foodLoverId: order.foodLoverId._id,
          orderId: order._id,
        });
        order.chatRoomId = chatroom.chatroom._id;
      }
      await this.changeBalanceAccordingToStatus(
        status,
        order,
        orderStatusReciever,
        UserInfo
      );
      order.orderStatus = status;
      order.reason=reason?reason:""
      let updatedOrder = await order.save();
      // let {phoneNo}=order.foodLoverId
      let sendStatusToPhoneNo =
        orderStatusReciever === "foodLoverId"
          ? order.foodLoverId.phoneNo
          : order.foodCreatorId.phoneNo;
      this.ordersGateway.handleUpdateStatus(
        sendStatusToPhoneNo,
        updatedOrder,
        order[orderStatusReciever].fcmRegistrationToken
      );
      // console.log(UserInfo.fcmRegistrationToken);
      // console.log("==============>", order[orderStatusReciever]);
      // console.log("CHATROOM", updatedOrder);
      return { updatedOrder };
    } catch (error) {
      this.logger.error(error, error.stack);
      console.log(error)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async changeBalanceAccordingToStatus(
    status,
    order,
    orderStatusReciever,
    orderStatusSender
  ) {
    try {
      if (status === "Accepted") {
        // console.log(order.foodLoverId)
        //Wallet of sender(FC) and reciever(FL)
        let statusRecieverWallet = await this.walletModel.findById(
          order.foodLoverId.walletId
        );
        let statusSenderWallet = await this.walletModel.findById(
          orderStatusSender.walletId
        );
        // console.log(statusRecieverWallet,statusSenderWallet)
        //Retrieving assets of both FC and FL
        let senderAssets = statusRecieverWallet.assets.find(
          (asset) => asset.tokenName == order.tokenName
        );
        let receiverAssets = statusSenderWallet.assets.find(
          (asset) => asset.tokenName == order.tokenName
        );
        //bill distribution
        let orderBillSixty = order.realOrderBill * 0.6;
        let orderBillForty = order.realOrderBill * 0.4;
        //if FC have no assets
        if (!receiverAssets) {
          let token: any = {
            tokenAddress: "NOSH",
            tokenSymbol: order.tokenName,
            tokenName: order.tokenName,
            amount: orderBillSixty,
          };
          //create asset with amount of bill I.e 60% of total bill
          console.log(token);
          statusSenderWallet.assets.push(token);
          //setting escrow of FC with 40% of bill
          statusSenderWallet.escrow =
            statusSenderWallet.escrow + +orderBillForty;
          //setting escrow of FL with 40% of bill

          statusRecieverWallet.escrow =
            statusRecieverWallet.escrow + +orderBillForty;
          await statusSenderWallet.save();

          senderAssets.amount =
            senderAssets.amount - order.orderBill - order.NoshDeduct;
          console.log("Sender Assets", senderAssets);
          await statusRecieverWallet.save();
        } else {
          //if receiver FC have assets
          receiverAssets.amount = receiverAssets.amount + +orderBillSixty;
          statusSenderWallet.escrow =
            statusSenderWallet.escrow + +orderBillForty;
          statusRecieverWallet.escrow =
            statusRecieverWallet.escrow + +orderBillForty;
          senderAssets.amount =
            senderAssets.amount - order.orderBill - order.NoshDeduct;
          await statusSenderWallet.save();
          await statusRecieverWallet.save();
        }
      } else if (status === "Order Completed") {
        await this.incrementOrderInMenuItems(order.orderedFood);
        await this.foodCreatorModel.findByIdAndUpdate(order.foodCreatorId._id, {
          $inc: { totalNoshedOrders: 1 },
        });
        await this.chatService.closeChatRoom(order.chatRoomId);
        let orderBillForty = order.realOrderBill * 0.4;
        let statusRecieverWallet = await this.walletModel.findById(
          order.foodCreatorId.walletId
        );
        let statusSenderWallet = await this.walletModel.findById(
          orderStatusSender.walletId
        );
        let asset = statusRecieverWallet.assets.find(
          (asset) => asset.tokenName == order.tokenName
        );
        asset.amount = asset.amount + +orderBillForty;
        statusRecieverWallet.escrow =
          statusRecieverWallet.escrow - orderBillForty;
        statusSenderWallet.escrow = statusSenderWallet.escrow - orderBillForty;
        // console.log('===============>',orderStatusSender.phoneNo,"==============>",order.foodCreatorId.phoneNo)
        await this.walletService.createTransaction({
          transactionType: "Payment Received",
          to: order.foodCreatorId.phoneNo,
          onSenderModel: "FoodLover",
          senderId: orderStatusSender._id,
          onReceiverModel: "FoodCreator",
          receiverId: order.foodCreatorId._id,
          from: orderStatusSender.phoneNo,
          deductAmount: order.NoshDeduct,
          amount: order.orderBill,
          currency: order.tokenName,
          status: "SUCCESSFUL",
        });
        await statusSenderWallet.save();
        await statusRecieverWallet.save();
      } else if (status === "Cancel") {
        let statusRecieverWallet = await this.walletModel.findById(
          order.foodCreatorId.walletId
        );
        let statusSenderWallet = await this.walletModel.findById(
          orderStatusSender.walletId
        );
        let FC_Assets = statusRecieverWallet.assets.find(
          (asset) => asset.tokenName == order.tokenName
        );
        let FL_Assets = statusSenderWallet.assets.find(
          (asset) => asset.tokenName == order.tokenName
        );
        let orderBillSixty = order.realOrderBill * 0.6;
        let orderBillForty = order.realOrderBill * 0.4;
        statusRecieverWallet.escrow =
          statusRecieverWallet.escrow - orderBillForty;
        statusSenderWallet.escrow=statusSenderWallet.escrow-orderBillSixty
        FC_Assets.amount = FC_Assets.amount + orderBillForty - orderBillSixty;
        FL_Assets.amount = FL_Assets.amount + orderBillSixty;
        await statusRecieverWallet.save();
        await statusSenderWallet.save();
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw error;
    }
  }
  async incrementOrderInMenuItems(orderedFoods) {
    orderedFoods.map(async (orderedFood) => {
      console.log(orderedFood.menuItemId);
      await this.menuItemsModel.findByIdAndUpdate(orderedFood.menuItemId, {
        $inc: { orderCounts: 1 },
      });
    });
  }
  async getReviews(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel.findOne({ phoneNo: user.phoneNo });
      }
      if (!UserInfo) {
        throw {
          msg: "USER NOT FOUND",
          status: HttpStatus.NOT_FOUND,
        };
      }
      let reviews = await this.ordersModel
        .find({ foodCreatorId: req.param.foodCreatorId })
        .select("rating review");
      return { reviews };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async addRating(req) {
    try {
      let { user } = req;
      // console.log(user)
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User not found";
      }
      let addRating = await this.ordersModel.findByIdAndUpdate(
        req.body.orderId,
        {
          $set: {
            rating: req.body.rating,
            review: req.body.review,
          },
        }
      );
      // console.log(addRating)
      let orderRating = await this.ordersModel.aggregate([
        {
          $match: {
            foodCreatorId: new Types.ObjectId(addRating.foodCreatorId),
          },
        },
        {
          $project: {
            foodCreatorId: 1,
            singleOrder: { $avg: "$rating" },
          },
        },
        {
          $group: {
            _id: "$foodCreatorId",
            orderAvg: { $avg: "$singleOrder" },
          },
        },
      ]);
      let updateAvg = await this.foodCreatorModel.findByIdAndUpdate(
        addRating.foodCreatorId,
        {
          $set: {
            avgRating: orderRating[0].orderAvg,
          },
        },
        { upsert: true }
      );
      // console.log(updateAvg,orderRating[0].orderAvg,"QQQQQQQQQQQ")
      return {
        message: "Order Rated Successfully",
      };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw error;
    }
  }
  async getOrderHistory(req) {
    try {
      let getOrdersReciever = "foodLoverId";
      let name = "username imageUrl";
      let { user } = req;
      let UserInfo: any = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodLoverModel.findOne({
          phoneNo: user.phoneNo,
        });
        getOrdersReciever = "foodCreatorId";
        name = "businessName imageUrl";
      }
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      const resultsPerPage = 10;
      let page = req.params.page >= 1 ? req.params.page : 1;
      page = page - 1;
      let sorting =
        getOrdersReciever === "foodCreatorId"
          ? { orderId: "desc" }
          : { timestamp: "desc" };

      let Orders = await this.ordersModel
        .find({
          $or: [{ foodCreatorId: UserInfo._id }, { foodLoverId: UserInfo._id }],
          orderStatus: {
            $nin: [
              "New",
              "Accepted",
              "Being Prepared",
              "Prepared",
              "InTransit",
            ],
          },
        })
        .sort(sorting)
        .limit(resultsPerPage)
        .skip(resultsPerPage * page)
        .populate(getOrdersReciever, name);
      return { Orders };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  async checkPromo(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let promos = ["Nosh40", "Dec20", "AB12"];
      let check = promos.filter((promo) => req.body.promoCode === promo);
      if (check.length) {
        return { promoCode: true };
      } else {
        return { promoCode: false };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
}
