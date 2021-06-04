import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FoodCreator } from "src/food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";
import { MenuItems } from "src/menu/menu.model";
import { Orders } from "src/orders/orders.model";
import { Review } from "./review.model";

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel("Reviews") private readonly reviewModel: Model<Review>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("Orders") private readonly orderModel: Model<Orders>,
    @InjectModel("MenuItems") private readonly menuItemModel: Model<MenuItems>
  ) {}
  private logger = new Logger("Reviews");
  async getUnreviewedMenuItems(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let unreviewedMenuItems = await this.reviewModel
        .find({
          $and: [{ foodLoverId: UserInfo._id }, { review: { $exists: false } }],
        })
        .populate([
          {
            path: "orderId",
            select:
              "orderedFood orderId foodCreatorLocation locationTo locationFrom",
          },
          {
            path: "foodCreatorId",
            select: "businessName imageUrl",
          },
          {
            path: "foodLoverId",
            select: "username imageUrl",
          },
        ]);
      return { unreviewedMenuItems };
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
  async getReviewedMenuItems(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel.findOne({
          phoneNo: user.phoneNo,
        });
      }
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let reviewedMenuItems = await this.reviewModel
        .find({
          $and: [
            { menuItemId: req.params.menuItemId },
            { review: { $exists: true } },
          ],
        })
        .populate([
          {
            path: "orderId",
            select:
              "orderedFood orderId foodCreatorLocation locationTo locationFrom",
          },
          {
            path: "foodCreatorId",
            select: "businessName imageUrl",
          },
          {
            path: "foodLoverId",
            select: "username imageUrl",
          },
        ]);
      return { reviewedMenuItems };
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
  async getUnreviewedMenuItemsByOrder(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let unreviewedMenuItemsByOrder = await this.reviewModel
        .find({
          $and: [
            { orderId: req.params.orderId },
            { review: { $exists: false } },
          ],
        })
        .populate([
          {
            path: "orderId",
            select:
              "orderedFood orderId foodCreatorLocation locationTo locationFrom",
          },
          {
            path: "foodCreatorId",
            select: "businessName imageUrl",
          },
          {
            path: "foodLoverId",
            select: "username imageUrl",
          },
        ]);
      return { unreviewedMenuItemsByOrder };
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
  async getReviewedMenuItemsByOrder(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel.findOne({
          phoneNo: user.phoneNo,
        });
      }
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let reviewedMenuItemsByOrder = await this.reviewModel
        .find({
          $and: [
            { orderId: req.params.orderId },
            { review: { $exists: true } },
          ],
        })
        .populate([
          {
            path: "orderId",
            select:
              "orderedFood orderId foodCreatorLocation locationTo locationFrom",
          },
          {
            path: "foodLoverId",
            select: "username imageUrl",
          },
        ]);
      return { reviewedMenuItemsByOrder };
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
  async getReviewedByFoodCreatorId(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel.findOne({
          phoneNo: user.phoneNo,
        });
      }
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let reviewedOfFoodCreator = await this.reviewModel
        .find({
          $and: [
            { foodCreatorId: req.params.foodCreatorId },
            { review: { $exists: true } },
          ],
        })
        .populate([
          // {
          //   path: "orderId",
          //   select:
          //     "orderedFood orderId foodCreatorLocation locationTo locationFrom",
          // },
          {
            path: "foodLoverId",
            select: "username imageUrl",
          },
        ]);
      return { reviewedOfFoodCreator };
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
  async updateReview(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let review = await this.reviewModel.findByIdAndUpdate(req.body.reviewId, {
        review: req.body.review,
        rating: req.body.rating,
        timestamp: req.body.timestamp,
      });
      let unreviewedMenuItemsByOrder = await this.reviewModel.find({
        $and: [{ orderId: review.orderId }, { review: { $exists: false } }],
      });
      if (!unreviewedMenuItemsByOrder.length) {
        await this.orderModel.findByIdAndUpdate(review.orderId, {
          orderReviewed: true,
        });
      }
      let orderRating = await this.reviewModel.aggregate([
        {
          $facet: {
            ratedOrder: [
              {
                $match: {
                  foodCreatorId: new Types.ObjectId(review.foodCreatorId),
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
            ],
            ratedMenu: [
              {
                $match: {
                  menuItemId: new Types.ObjectId(review.menuItemId),
                },
              },
              {
                $project: {
                  menuItemId: 1,
                  singleOrder: { $avg: "$rating" },
                },
              },
              {
                $group: {
                  _id: "$menuItemId",
                  orderAvg: { $avg: "$singleOrder" },
                },
              },
            ],
          },
        },
      ]);
      console.log(orderRating[0]);
      let updateAvg = await this.foodCreatorModel.findByIdAndUpdate(
        review.foodCreatorId,
        {
          $set: {
            avgRating: orderRating[0].ratedOrder[0].orderAvg,
          },
        },
        { upsert: true }
      );
      let updateMenuRatingAvg = await this.menuItemModel.findByIdAndUpdate(
        review.menuItemId,
        {
          $set: {
            rating: orderRating[0].ratedMenu[0].orderAvg,
          },
        },
        { upsert: true }
      );
      console.log(updateMenuRatingAvg);
      return { message: "Review Updated" };
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
