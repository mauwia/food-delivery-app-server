import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FoodCreator } from "src/food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";
import { NotificationGateway } from "./notification.gateway";
import { Notification } from "./notification.model";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel("Notification")
    private readonly notificationModel: Model<Notification>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    private readonly notificationGateway: NotificationGateway
  ) {}
  async createNotification(body) {
    let newNotification = new this.notificationModel(body);
    let notification = await this.notificationModel.create(newNotification);
    return await notification
      .populate([
        {
          path: "receiverId",
          select: "phoneNo username imageUrl businessName avgRating ",
        },
        {
          path: "senderId",
          select: "username imageUrl businessName avgRating",
        },
        {
          path: "transactionId",
          populate: [
            {
              path: "senderId",
              select: "username imageUrl businessName",
            },
            {
              path: "receiverId",
              select: "username imageUrl businessName",
            },
          ],
        },
        {
          path: "orderId",
          populate: [
            {
              path: "foodCreatorId",
              select: "username imageUrl businessName",
            },
            {
              path: "foodLoverId",
              select: "username imageUrl",
            },
          ],
        },
        {
          path: "messageId",
        },
        // {
        //   path:"chatRoomId",

        // }
      ])
      .execPopulate();
  }
  async updateNotification(body) {
    let update = await this.notificationModel.findOneAndUpdate(
      { chatRoomId: body.chatroomId },
      {
        messageId: body.messageId,
        updatedAt: body.updatedAt,
      }
    ).populate([
      {
        path: "receiverId",
        select: "phoneNo username imageUrl businessName avgRating ",
      },
      {
        path: "senderId",
        select: "username imageUrl businessName avgRating",
      },
      {
        path: "transactionId",
        populate: [
          {
            path: "senderId",
            select: "username imageUrl businessName",
          },
          {
            path: "receiverId",
            select: "username imageUrl businessName",
          },
        ],
      },
      {
        path: "orderId",
        populate: [
          {
            path: "foodCreatorId",
            select: "username imageUrl businessName",
          },
          {
            path: "foodLoverId",
            select: "username imageUrl",
          },
        ],
      },
      {
        path: "messageId",
      },
      // {
      //   path:"chatRoomId",

      // }
    ]);
    console.log(update);
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
      page = page - 1;
      UserInfo.unseenNotification = 0;
      UserInfo.save();
      this.notificationGateway.updateNotificationCountToZero(UserInfo.phoneNo);
      let notifications = await this.notificationModel
        .find({
          $or: [{ senderId: UserInfo._id }, { receiverId: UserInfo._id }],
        })
        .sort({ updatedAt: "desc" })
        // .limit(resultsPerPage)
        // .skip(resultsPerPage * page)
        .populate([
          {
            path: "receiverId",
            select: "phoneNo username imageUrl businessName avgRating ",
          },
          {
            path: "senderId",
            select: "username imageUrl businessName avgRating",
          },
          {
            path: "transactionId",
            populate: [
              {
                path: "senderId",
                select: "username imageUrl businessName",
              },
              {
                path: "receiverId",
                select: "username imageUrl businessName",
              },
            ],
          },
          {
            path: "orderId",
            populate: [
              {
                path: "foodCreatorId",
                select: "username imageUrl businessName",
              },
              {
                path: "foodLoverId",
                select: "username imageUrl",
              },
            ],
          },
          {
            path: "messageId",
          },
          // {
          //   path:"chatRoomId",

          // }
        ]);
      // console.log(notifications)
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
  async getNotificationsFC(req) {
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
      console.log(req.params.page);
      page = page - 1;
      UserInfo.unseenNotification = 0;
      UserInfo.save();
      this.notificationGateway.updateNotificationCountToZero(UserInfo.phoneNo);
      let notifications = await this.notificationModel
        .find({
          $or: [{ senderId: UserInfo._id }, { receiverId: UserInfo._id }],
        })
        .sort({ updatedAt: "desc" })
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
            populate: [
              {
                path: "senderId",
                select: "username imageUrl businessName",
              },
              {
                path: "receiverId",
                select: "username imageUrl businessName",
              },
            ],
          },
          {
            path: "orderId",
            populate: [
              {
                path: "foodCreatorId",
                select: "username imageUrl businessName",
              },
              {
                path: "foodLoverId",
                select: "username imageUrl",
              },
            ],
          },
          {
            path: "messageId",
          },
        ]);
      console.log(notifications);

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
