import { Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { request, Request } from "express";
import { JWTAuthGuard } from "../foodLover/jwt/jwt-auth.guard";

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService:ReviewService ) {}
    @UseGuards(new JWTAuthGuard())
    @Get('/getUnreviewedMenuItems')
    async getUnreviewedMenuItems(@Req() req:Request){
      let response=await this.reviewService.getUnreviewedMenuItems(req)
      return response
    }
    @UseGuards(new JWTAuthGuard())
    @Get('/getReviewedMenuItems/:menuItemId')
    async getReviewedMenuItems(@Req() req:Request){
      let response=await this.reviewService.getReviewedMenuItems(req)
      return response
    }
    @UseGuards(new JWTAuthGuard())
    @Get('/getUnreviewedMenuItemsByOrder/:orderId')
    async getUnreviewedMenuItemsByOrder(@Req() req:Request){
      let response=await this.reviewService.getUnreviewedMenuItemsByOrder(req)
      return response
    }
    @UseGuards(new JWTAuthGuard())
    @Get('/getReviewedMenuItemsByOrder/:orderId')
    async getReviewedMenuItemsByOrder(@Req() req:Request){
      let response=await this.reviewService.getReviewedMenuItemsByOrder(req)
      return response
    }
    @UseGuards(new JWTAuthGuard())
    @Get('/getReviewedByFoodCreatorId/:foodCreatorId')
    async getReviewedByFoodCreatorId(@Req() req:Request){
      let response=await this.reviewService.getReviewedByFoodCreatorId(req)
      return response
    }
    @UseGuards(new JWTAuthGuard())
    @Get('/getReviewedByFoodLoverId/:foodLoverId')
    async getReviewedByFoodLoverId(@Req() req:Request){
      let response=await this.reviewService.getReviewedByFoodLoverId(req)
      return response
    }
    @UseGuards(new JWTAuthGuard())
    @Put('/updateReview')
    async updateReview(@Req() req:Request){
      let response=await this.reviewService.updateReview(req)
      return response
    }
    
    
}
