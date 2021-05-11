import { Controller, Post, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { request, Request } from "express";

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService:ReviewService ) {}
    @Post('/createReview')
    async CreateReview(@Req() req:Request){
        let review=await this.reviewService.insertReviews(req)
        return review
    }
}
