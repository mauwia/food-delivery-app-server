import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Orders } from "src/orders/orders.model";
import * as moment from "moment";
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>
  ) {}
  async getAnalyticsOfToday(req) {
    // let yesterdayAnalytics = await this.ordersModel
    //   .find({
    //     foodCreatorId: "609a386c8b5ba300214d2ac6",
    //     timestamp: {
    //       $gte: moment().subtract(1, "days").startOf("day").unix().toString(),
    //       $lte: moment().subtract(1, "days").endOf("day").unix().toString(),
    //     },
    //   })
    //   .select("orderStatus orderId orderBill");
    let todayAnalytics = await this.ordersModel.aggregate([
      {
        $match: {
          $and: [
            { foodCreatorId: Types.ObjectId("609a386c8b5ba300214d2ac6") },
            {
              timestamp: {
                $gte: moment().startOf("day").unix().toString(),
                $lte: moment().endOf("day").unix().toString(),
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: "$foodCreatorId",
          totalBill: { $sum: "$orderBill" },
          
        },
      },

    ]);
    console.log(todayAnalytics);
    // let todayAnalytics = await this.ordersModel
    //   .find({
    //     foodCreatorId: "609a386c8b5ba300214d2ac6",
    //     timestamp: {
    //       $gte: moment().startOf("day").unix().toString(),
    //       $lte: moment().endOf("day").unix().toString(),
    //     },
    //   })
    //   .select("orderStatus orderId orderBill ");

    return { todayAnalytics };
  }
}
