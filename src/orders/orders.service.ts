import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FoodCreator } from "../food-creator/food-creator.model";
import { FoodLover } from "../foodLover/foodLover.model";
import { pad } from "../utils";
import { OrdersGateway } from "./orders.gateway";
import { Orders } from "./orders.model";
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
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
        let ordercreate = await this.addOrders(body.orders[i]);
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

  async addOrders(order) {
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
      let name='username'
      let UserInfo:any = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodLoverModel.findOne({
          phoneNo: user.phoneNo,
        });
      getOrdersReciever = "foodCreatorId";
      name='businessName'
      }
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let Orders = await this.ordersModel.find({
        $and: [
          // { foodCreatorId: UserInfo._id },
          {
            $or: [
              { foodLoverId: UserInfo._id },
              { foodCreatorId: UserInfo._id },
            ],
          },
          { orderStatus: { $nin: ["Decline", "Complete"] } },
        ],
      }).populate(getOrdersReciever,name);
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
      let UserInfo: any = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodLoverModel.findOne({
          phoneNo: user.phoneNo,
        });
        orderStatusReciever = "foodCreatorId";
      }
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let { orderID, status } = req.body;
      let order = await this.ordersModel
        .findById(orderID)
        .populate(orderStatusReciever, "phoneNo");
      order.orderStatus = status;
      let updatedOrder = await order.save();
      // let {phoneNo}=order.foodLoverId
      let sendStatusToPhoneNo =
        orderStatusReciever === "foodLoverId"
          ? order.foodLoverId.phoneNo
          : order.foodCreatorId.phoneNo;
      console.log(sendStatusToPhoneNo);
      this.ordersGateway.handleUpdateStatus(sendStatusToPhoneNo, updatedOrder);
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
  async getOrderHistory(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      const resultsPerPage = 3;
      let page = req.params.page >= 1 ? req.params.page : 1;
      page = page - 1;
      let Orders = await this.ordersModel
        .find({
          foodCreatorId: UserInfo._id,
        })
        .sort({ orderId: "desc" })
        .limit(resultsPerPage)
        .skip(resultsPerPage * page);
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
