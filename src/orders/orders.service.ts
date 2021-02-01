import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Wallet } from "src/wallet/wallet.model";
import { WalletModule } from "src/wallet/wallet.module";
import { WalletService } from "src/wallet/wallet.service";
import { FoodCreator } from "../food-creator/food-creator.model";
import { FoodLover } from "../foodLover/foodLover.model";
import { pad } from "../utils";
import { OrdersGateway } from "./orders.gateway";
import * as admin from "firebase-admin";
import { Orders } from "./orders.model";
import { userInfo } from "os";
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("Wallet") private readonly walletModel: Model<Wallet>,
    private readonly walletService: WalletService,
    private readonly ordersGateway: OrdersGateway
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
      for (let i = 0; i < body.orders.length; i++) {
        let ordercreate = await this.addOrders(body.orders[i], UserInfo);
        createdOrders.push(ordercreate);
      }
      console.log(createdOrders);
      return { orders: createdOrders };
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
      let newOrder = new this.ordersModel(order);
      newOrder.orderId =
        "#" + pad(incrementOrder, foodCreator.totalOrders.length);
      let orderCreated = await this.ordersModel.create(newOrder);
      orderCreated = await orderCreated
        .populate({
          path: "foodLoverId",
          select: "username",
        })
        .execPopulate();
        await admin
        .messaging()
        .sendToDevice(foodCreator.fcmRegistrationToken, {
          notification: {
            title: `New Order is Arrived`,
            body: "Tap to view details",
          },
        });
      this.ordersGateway.handleAddOrder(foodCreator.phoneNo, orderCreated);
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
      let { orderID, status } = req.body;
      let order = await this.ordersModel
        .findById(orderID)
        .populate(
          orderStatusReciever,
          `phoneNo fcmRegistrationToken walletId ${name}`
        );
      await this.changeBalanceAccordingToStatus(
        status,
        order,
        orderStatusReciever,
        UserInfo
      );
      order.orderStatus = status;
      let updatedOrder = await order.save();
      // let {phoneNo}=order.foodLoverId
      let sendStatusToPhoneNo =
        orderStatusReciever === "foodLoverId"
          ? order.foodLoverId.phoneNo
          : order.foodCreatorId.phoneNo;
      console.log(sendStatusToPhoneNo);
      this.ordersGateway.handleUpdateStatus(sendStatusToPhoneNo, updatedOrder);
      console.log(UserInfo.fcmRegistrationToken);
      console.log('==============>',order[orderStatusReciever])
        await admin
          .messaging()
          .sendToDevice(order[orderStatusReciever].fcmRegistrationToken, {
            notification: {
              title: `Order ${status}`,
              body: "Tap to view details",
            },
          });
      return { updatedOrder };
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
  async changeBalanceAccordingToStatus(
    status,
    order,
    orderStatusReciever,
    orderStatusSender
  ) {
    try {
      if (status === "Accepted") {
        // console.log(order.foodLoverId)
        let statusRecieverWallet = await this.walletModel.findById(
          order.foodLoverId.walletId
        );
        let statusSenderWallet = await this.walletModel.findById(
          orderStatusSender.walletId
        );
        // console.log(statusRecieverWallet,statusSenderWallet)

        let senderAssets = statusRecieverWallet.assets.find(
          (asset) => asset.tokenName == order.tokenName
        );
        let receiverAssets = statusSenderWallet.assets.find(
          (asset) => asset.tokenName == order.tokenName
        );
        let orderBillSixty = order.orderBill * 0.6;
        let orderBillForty = order.orderBill * 0.4;
        if (!receiverAssets) {
          let token: any = {
            tokenAddress: "NOSH",
            tokenSymbol: order.tokenName,
            tokenName: order.tokenName,
            amount: orderBillSixty,
          };
          console.log(token);
          statusSenderWallet.assets.push(token);
          statusSenderWallet.escrow =
            statusSenderWallet.escrow + +orderBillForty;
          statusRecieverWallet.escrow =
            statusRecieverWallet.escrow + +orderBillForty;
          await statusSenderWallet.save();
          senderAssets.amount = senderAssets.amount - order.orderBill;
          await statusRecieverWallet.save();
        } else {
          receiverAssets.amount = receiverAssets.amount + +orderBillSixty;
          statusSenderWallet.escrow =
            statusSenderWallet.escrow + +orderBillForty;
          senderAssets.amount = senderAssets.amount - order.orderBill;
          await statusSenderWallet.save();
          await statusRecieverWallet.save();
        }
      } else if (status === "Order Completed") {
        let orderBillForty = order.orderBill * 0.4;
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
          from: orderStatusSender.phoneNo,
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
        let orderBillSixty = order.orderBill * 0.6;
        let orderBillForty = order.orderBill * 0.4;
        statusRecieverWallet.escrow =
          statusRecieverWallet.escrow - orderBillForty;
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
  async getOrderHistory(req) {
    try {
      let getOrdersReciever = "foodLoverId";
      let name = "username";
      let { user } = req;
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
