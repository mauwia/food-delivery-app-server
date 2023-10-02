import { Request } from "express";
import { Controller, UseGuards, Post, Req, Delete, Get, Param } from '@nestjs/common';
import { JWTAuthGuard } from "../foodLover/jwt/jwt-auth.guard";
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @UseGuards(new JWTAuthGuard())
  @Post('/subscribe')
  async subscribeToFC(@Req() req: Request) {
    const response = await this.subscriptionsService.subscribe(req);
    return response;
  }

  @UseGuards(new JWTAuthGuard())
  @Delete('/unsubscribe')
  async unscubscribeFromFC(@Req() req: Request) {
    const response = await this.subscriptionsService.unsubscribe(req);
    return response;
  }

  @UseGuards(new JWTAuthGuard())
  @Get('/:foodCreatorID')
  async getFcSubscriptions(@Req() req: Request, @Param('foodCreatorID') foodCreatorID: string) {
    const response = await this.subscriptionsService.getFcSubscriptions(req, foodCreatorID);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Get('/fl/:foodLoverID')
  async getFlSubscriptions(@Req() req: Request, @Param('foodLoverID') foodLoverID: string) {
    const response = await this.subscriptionsService.getFlSubscription(req, foodLoverID);
    return response;
  }

  @UseGuards(new JWTAuthGuard())
  @Get('/:foodCreatorID/fl')
  async isFlSubscribedToFC(@Req() req: Request, @Param('foodCreatorID') foodCreatorID: string) {
    const response = await this.subscriptionsService.isFlSubscribedToFC(req, foodCreatorID);
    return response;
  }
}
