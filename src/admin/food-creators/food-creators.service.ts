import { Model, PaginateModel, ObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FoodCreator } from "../../food-creator/food-creator.model";
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
export class FoodCreatorsService {
  constructor(
    @InjectModel("FoodCreator") private readonly foodCreatorModel: PaginateModel<FoodCreator>,
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
  ) {}

  async getAllCreators(queryParams: GetAllRequestParams): Promise<Paginated> {
    let query = {};
    const options = getPaginationOptions(queryParams);

    if (queryParams.search) {
      query = {
        $or: [          
          { email: new RegExp(queryParams.search, 'i') },
          { username: new RegExp(queryParams.search, 'i') },
          { businessName: new RegExp(queryParams.search, 'i') },
          { 'location.address': new RegExp(queryParams.search, 'i') },
        ],
      };
    }

    const result = await this.foodCreatorModel.paginate(query, options);
    return getPaginatedResult(result);
  }

  async getCreator(id: ObjectId): Promise<FoodCreator> {
    const result = await this.foodCreatorModel.findById(id);
    return result;
  }

  async getCreatorsByVerificationStatus(queryParams: GetAllRequestParams, status: String) {
    const options = getPaginationOptions(queryParams);
    let query = {
      adminVerified: status,
    };

    if (queryParams.search) {
      query['$or'] = [          
        { email: new RegExp(queryParams.search, 'i') },
        { phoneNo: new RegExp(queryParams.search, 'i') },
        { username: new RegExp(queryParams.search, 'i') },
        { businessName: new RegExp(queryParams.search, 'i') },
        { 'location.address': new RegExp(queryParams.search, 'i') },
      ];
    }

    const result = await this.foodCreatorModel.paginate(query, options);
    return getPaginatedResult(result);
  }

  async updateVerificationStatus(id, newStatus) {
    const updatedFC = await this.foodCreatorModel.findOneAndUpdate(
      { _id: id },
      { $set: {
        adminVerified: newStatus,
        ...(newStatus === 'Ongoing' && { adminVerificationStart: Date.now() }),
        ...(newStatus === 'Completed' && { adminVerificationComplete: Date.now() }),
      }},
      { new: true }
    );
    return updatedFC;
  }

  async updateVerificationStage(id, newStage) {
    const updatedFC = await this.foodCreatorModel.findOneAndUpdate(
      { _id: id },
      { $set: {
        adminVerificationStage: newStage,
      }},
      { new: true }
    );
    return updatedFC;
  }

  async getCreatorsMetrics() {
    const totalCreators = await this.foodCreatorModel.estimatedDocumentCount();
    const verified = await this.foodCreatorModel.countDocuments({ adminVerified: { $in: ['Completed', 'Verified'] }})
    const fulfillingDay = await this.ordersModel.aggregate(FulfillingFcToday());
    const fulfillingWeek = await this.ordersModel.aggregate(FulfillingFcWeek());
    const fulfillingMonth = await this.ordersModel.aggregate(FulfillingFcMonth());
    
    return {
      // total, verified, fulfilling, active
      total: totalCreators,
      verified,
      fulfilling: {
        today: fulfillingDay.length
          ? fulfillingDay[0].fulfillingDayCount
          : 0,
        week: fulfillingWeek.length
          ? fulfillingWeek[0].fulfillingWeekCount
          : 0,
        month: fulfillingMonth.length
          ? fulfillingMonth[0].fulfillingMonthCount
          : 0,
      },
    }
  }
}
