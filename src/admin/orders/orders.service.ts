import { Model, PaginateModel, ObjectId } from 'mongoose';
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
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
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
}
