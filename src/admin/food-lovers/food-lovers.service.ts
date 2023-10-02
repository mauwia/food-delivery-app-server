import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
import { 
  getPaginationOptions,
  GetAllRequestParams,
  getPaginatedResult,
  Paginated } from '../shared/pagination';

@Injectable()
export class FoodLoversService {
  constructor(
    @InjectModel("FoodLover") private readonly foodLoverModel,
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

    const pipeline = await this.getFLPipeline(query);
    const aggregate = this.foodLoverModel.aggregate(pipeline);

    const result = await this.foodLoverModel.aggregatePaginate(aggregate, options);
    return getPaginatedResult(result);
  }

  async getLover(id: ObjectId) {
    const result = await this.foodLoverModel.findById(id);
    return result;
  }

  async getFLPipeline (query) {
    return [
      { $match: query },
      { $lookup: {
          from: "reviews",
          let: { foodLoverId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$foodLoverId", "$foodLoverId"] }
              }
            },
            { $count: "reviewsCount" },
          ],
          as: "reviews"
        },
      },
      { $lookup: {
        from: "orders",
        let: { foodLoverId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$foodLoverId", "$foodLoverId"] }
              }
            },
            { $count: "ordersCount" }
          ],
          as: "orders"
      }}
    ]
  }
}
