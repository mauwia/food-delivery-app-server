import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Review } from "./review.model";

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel("Reviews") private readonly reviewModel: Model<any>
  ) {}
  private logger = new Logger("Reviews");
  async insertReviews(req) {
      let newReview=await this.reviewModel.insertMany([
        {review:"HERLL"},{review:"CHECK"}]
      )
      
  }
}
