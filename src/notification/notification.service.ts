import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FoodCreator } from "src/food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";
import { Notification } from "./notification.model";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel("Notification")
    private readonly notificationModel: Model<Notification>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>
  ) {}
  async createNotification(body) {
    let newNotification = new this.notificationModel(body);
    return await this.notificationModel.create(newNotification);
  }
  async getNotificationsFL(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId");
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel
          .findOne({
            phoneNo: user.phoneNo,
          })
          .populate("walletId");
      }
      if (!UserInfo) {
        throw {
          msg: "USER NOT FOUND",
          status: HttpStatus.NOT_FOUND,
        };
      }
      const resultsPerPage = 10;
      let page = req.params.page >= 1 ? req.params.page : 1;
      console.log(req.params.page)
      page = page - 1
      let notifications = await this.notificationModel
        .find({
          $or: [{ senderId: UserInfo._id }, { receiverId: UserInfo._id }],
        }).sort({updatedAt:"desc"})
        // .limit(resultsPerPage)
        // .skip(resultsPerPage * page)
        .populate([
          {
            path: "receiverId",
            select: "phoneNo username imageUrl ",
          },
          {
            path: "senderId",
            select: "username imageUrl",
          },
          {
            path: "transactionId",
            select: "amount message",
          },
          {
            path: "orderId",
            select: "orderId orderedFood",
          },
        ]);
      return { notifications };
    } catch (error) {
      console.log(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
}
