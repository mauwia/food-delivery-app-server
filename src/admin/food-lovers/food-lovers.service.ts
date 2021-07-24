import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, ObjectId } from 'mongoose';
import { FoodLover } from "../../foodLover/foodLover.model";
import { 
  getPaginationOptions,
  GetAllRequestParams,
  getPaginatedResult,
  Paginated } from '../shared/pagination';

@Injectable()
export class FoodLoversService {
  constructor(
    @InjectModel("FoodLover") private readonly foodLoverModel: PaginateModel<FoodLover>,
  ) {}

  async getAllLovers(queryParams: GetAllRequestParams): Promise<Paginated> {
    let query = {};
    const options = getPaginationOptions(queryParams);

    if (queryParams.search) {
      query = {
        $or: [          
          { email: new RegExp(queryParams.search, 'i') },
          { phoneNo: new RegExp(queryParams.search, 'i') },
          { lastName: new RegExp(queryParams.search, 'i') },
          { username: new RegExp(queryParams.search, 'i') },
          { firstName: new RegExp(queryParams.search, 'i') },
          { 'location.address': new RegExp(queryParams.search, 'i') },
        ],
      };
    }

    const result = await this.foodLoverModel.paginate(query, options);
    return getPaginatedResult(result);
  }

  async getLover(id: ObjectId) {
    const result = await this.foodLoverModel.findById(id);
    return result;
  }
}
