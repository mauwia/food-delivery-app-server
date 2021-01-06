import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FoodCreator } from "src/food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";
import { pad } from "src/utils";
import { Orders } from "./orders.model";
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>
  ) { }
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
      for (let i = 0; i < body.orders.length; i++) {
        let ordercreate = await this.addOrders(body.orders[i])
        createdOrders.push(ordercreate)
      }
      console.log(createdOrders)
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
      return orderCreated
    }
    catch (error) {
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
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let Orders = await this.ordersModel.find({
        $and: [{ foodCreatorId: UserInfo._id }, { orderStatus: { $ne: 'Decline' } }]
      })
      return { Orders }
    }
    catch (error) {
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
  async getOrderHistory(req){
    
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
