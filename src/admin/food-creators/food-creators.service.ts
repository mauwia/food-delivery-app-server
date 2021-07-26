import { Model, PaginateModel, ObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FoodCreator } from "../../food-creator/food-creator.model";
import { VerificationDetail } from '../food-creators/verification-detail.model';
import { OrdersService } from '../orders/orders.service';
import { 
  getPaginationOptions,
  GetAllRequestParams,
  getPaginatedResult,
  Paginated } from '../shared/pagination';
import { ActiveFcToday } from '../analyticsQueries/dayQueries'

@Injectable()
export class FoodCreatorsService {
  constructor(
    @InjectModel("FoodCreator") private readonly foodCreatorModel: PaginateModel<FoodCreator>,
    @InjectModel("VerificationDetail") private readonly verificationDetail: Model<VerificationDetail>,
    private readonly adminOrdersService: OrdersService,
  ) {}

  async getAllCreators(queryParams: GetAllRequestParams): Promise<Paginated> {
    let query = {};
    const options = getPaginationOptions(queryParams);

    if (queryParams.search) {
      query = {
        $or: [          
          { email: new RegExp(queryParams.search, 'i') },
          { phoneNo: new RegExp(queryParams.search, 'i') },
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

    if (queryParams.filter) {
      query['adminVerificationStage'] = queryParams.filter;
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
    if (newStage === 'Account Activated') {
      await this.updateVerificationStatus(id, 'Completed');
    }
    const updatedFC = await this.foodCreatorModel.findOneAndUpdate(
      { _id: id },
      { $set: {
        adminVerificationStage: newStage,
      }},
      { new: true }
    );

    return updatedFC;
  }

  async addKycData (id, kycData) {
    kycData.fcId = id;
    const kyc = await this.verificationDetail.findOneAndReplace({ fcId: id },
      kycData, { upsert: true, new: true }
    );

    return kyc;
  }

  async getKycData (id) {
    const result = await this.verificationDetail.find({ fcId: id });
    return result[0];
  }

  async getCreatorsMetrics() {
    const totalCreators = await this.foodCreatorModel.estimatedDocumentCount();
    const verified = await this.foodCreatorModel.countDocuments({ adminVerified: { $in: ['Completed', 'Verified'] }});
    const fulfillingDay = await this.adminOrdersService.getFCsDailyOrdersCount();
    const fulfillingWeek = await this.adminOrdersService.getFCsWeeklyOrdersCount();
    const fulfillingMonth = await this.adminOrdersService.getFCsMonthlyOrdersCount();
    
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
      active: {},
    }
  }
}
