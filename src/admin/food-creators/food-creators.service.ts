import { Model, PaginateModel, ObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FoodCreator } from "../../food-creator/food-creator.model";
import { Menu } from "../../menu/menu.model";
import { VerificationDetail } from '../food-creators/verification-detail.model';
import { OrdersService } from '../orders/orders.service';
import { 
  getPaginationOptions,
  GetAllRequestParams,
  getPaginatedResult,
  Paginated } from '../shared/pagination';
import { uploadImage } from '../shared/imagekitHelper';
import { ActiveFCToday } from '../analyticsQueries/dayQueries';
import { ActiveFCWeek } from '../analyticsQueries/weekQueries';
import { ActiveFCMonth } from '../analyticsQueries/monthQueries';

const _uniq = require('lodash/uniq');

@Injectable()
export class FoodCreatorsService {
  constructor(
    @InjectModel("Menu") private readonly menuModel: PaginateModel<Menu>,
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
    } else {
      await this.updateVerificationStatus(id, 'Ongoing');
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

  async addKycData (id, kycData, files) {
    try {
      let images = [];
      let proofOfAddressUpload;
      let contactPersonGovIdUpload;

      for (const property in files) {
        images.push(files[property]);
      }

      if (images.length > 0) {
        const response = await Promise.all(images.map((picture) => uploadImage(picture[0], id)));
        response.forEach((upload) => {
          if (upload.name.includes('proofOfAddress')) {
            proofOfAddressUpload = upload;
          }

          if (upload.name.includes('contactPersonGovId')) {
            contactPersonGovIdUpload = upload;
          }
        });
      }

      kycData.fcId = id;
      if (proofOfAddressUpload) {
        kycData.proofOfAddress = proofOfAddressUpload.url;
        kycData.proofOfAddressFileId = proofOfAddressUpload.fileId;
      }
      if (contactPersonGovIdUpload) {
        kycData.contactPersonGovId = contactPersonGovIdUpload.url;
        kycData.contactPersonGovIdFileId = contactPersonGovIdUpload.fileId;
      }

      const kyc = await this.verificationDetail.findOneAndReplace({ fcId: id },
        kycData, { upsert: true, new: true }
      );

      return kyc;
    } catch (error) {
      console.log(JSON.parse(error.message));
    }
  }

  async getKycData (id: ObjectId) {
    const result = await this.verificationDetail.find({ fcId: id });
    return result[0];
  }

  async getFCUpdatedMenuDaily () {
    return await this.menuModel.aggregate(ActiveFCToday());
  }

  async getFCUpdatedProfileDaily () {
    return await this.foodCreatorModel.aggregate(ActiveFCToday());
  }

  async getFCUpdatedMenuWeek () {
    return await this.menuModel.aggregate(ActiveFCWeek());
  }

  async getFCUpdatedProfileWeek () {
    return await this.foodCreatorModel.aggregate(ActiveFCWeek());
  }

  async getFCUpdatedMenuMonth () {
    return await this.menuModel.aggregate(ActiveFCMonth());
  }

  async getFCUpdatedProfileMonth () {
    return await this.foodCreatorModel.aggregate(ActiveFCMonth());
  }

  async getCreatorsMetrics() {
    const totalCreators = await this.foodCreatorModel.estimatedDocumentCount();
    const verified = await this.foodCreatorModel.countDocuments({ adminVerified: { $in: ['Completed', 'Verified'] }});
    const fulfillingDay = await this.adminOrdersService.getFCsDailyOrdersCount();
    const fulfillingWeek = await this.adminOrdersService.getFCsWeeklyOrdersCount();
    const fulfillingMonth = await this.adminOrdersService.getFCsMonthlyOrdersCount();

    const fcUpdatedMenuDay = await this.getFCUpdatedMenuDaily();
    const fcUpdatedProfileDay = await this.getFCUpdatedProfileDaily();
    const fcProcessedOrderDay = fulfillingDay;
    const activeDayArray = [
      ...fcUpdatedMenuDay,
      ...fcUpdatedProfileDay,
      ...fcProcessedOrderDay].map(item => {
      if (item._id) {
        return "" + item._id;
      }
    });
    const uniqueActiveDayResult = _uniq(activeDayArray);

    const fcUpdatedMenuWeek = await this.getFCUpdatedMenuWeek();
    const fcUpdatedProfileWeek = await this.getFCUpdatedProfileWeek();
    const fcProcessedOrderWeek = fulfillingWeek;
    const activeWeekArray = [
      ...fcUpdatedMenuWeek,
      ...fcUpdatedProfileWeek,
      ...fcProcessedOrderWeek ].map(item => {
      if (item._id) {
        return "" + item._id;
      }
    });;
    const uniqueActiveWeekResult = _uniq(activeWeekArray);

    const fcUpdatedMenuMonth = await this.getFCUpdatedMenuMonth();
    const fcUpdatedProfileMonth = await this.getFCUpdatedProfileMonth();
    const fcProcessedOrderMonth = fulfillingMonth;
    const activeMonthResultArray = [
      ...fcUpdatedMenuMonth,
      ...fcUpdatedProfileMonth,
      ...fcProcessedOrderMonth ].map(item => {
      if (item._id) {
        return "" + item._id;
      }
    });
    const uniqueActiveMonthResult = _uniq(activeMonthResultArray).filter(Boolean);
    
    return {
      // total, verified, fulfilling, active
      total: totalCreators,
      verified,
      fulfilling: {
        today: fulfillingDay.length
          ? fulfillingDay.length
          : 0,
        week: fulfillingWeek.length
          ? fulfillingWeek.length
          : 0,
        month: fulfillingMonth.length
          ? fulfillingMonth.length
          : 0,
      },
      active: {
        today: uniqueActiveDayResult.length,
        week: uniqueActiveWeekResult.length,
        month: uniqueActiveMonthResult.length,
      },
    }
  }
}
