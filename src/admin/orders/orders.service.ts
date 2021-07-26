import { Model, PaginateModel, ObjectId, Aggregate } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Orders } from '../../orders/orders.model';
import { 
  getPaginationOptions,
  GetAllRequestParams,
  getPaginatedResult,
  Paginated } from '../shared/pagination';
import { FulfillingFcToday } from '../analyticsQueries/dayQueries'
import { FulfillingFcWeek } from '../analyticsQueries/weekQueries'
import { FulfillingFcMonth } from '../analyticsQueries/monthQueries'

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel,
  ) {}

  async getFCsDailyOrdersCount () {
    return await this.ordersModel.aggregate(FulfillingFcToday());
  }

  async getFCsWeeklyOrdersCount () {
    return await this.ordersModel.aggregate(FulfillingFcWeek());
  }
  
  async getFCsMonthlyOrdersCount () {
    return await this.ordersModel.aggregate(FulfillingFcMonth());
  }

  async getOrdersByStatus (queryParams: GetAllRequestParams, status: string) {
    const options = getPaginationOptions(queryParams);
    let query = {
      orderStatus: status,
    };

    const aggregate = this.ordersModel.aggregate()
      .match(query)
      .lookup({
        from: "foodcreators",
        let: { foodCreatorId: "$foodCreatorId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$foodCreatorId", "$_id"] }
              }
            },
            {
              $project: {
                "businessName": 1
              }
            }
          ],
          as: "foodCreator"
      })
      .lookup({
        from: "foodlovers",
        let: { foodLoverId: "$foodLoverId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$foodLoverId", "$_id"] }
              }
            },
            {
              $project: {
                "firstName": 1,
                "lastName": 1
              }
            }
          ],
          as: "foodLover"
      })
      .lookup({
        from: "messages",
          localField: "chatRoomId",
          foreignField: "chatroomId",
          as: "chat"
      });

    const result = await this.ordersModel.aggregatePaginate(aggregate, options);
    return getPaginatedResult(result);
  }
}
