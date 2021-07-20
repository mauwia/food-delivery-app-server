import { PaginateModel, ObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FoodCreator } from "../../food-creator/food-creator.model";
import { 
  getPaginationOptions,
  GetAllRequestParams,
  getPaginatedResult,
  Paginated } from '../shared/pagination';

@Injectable()
export class FoodCreatorsService {
  constructor(
    @InjectModel("FoodCreator") private readonly foodCreatorModel: PaginateModel<FoodCreator>,
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
}
