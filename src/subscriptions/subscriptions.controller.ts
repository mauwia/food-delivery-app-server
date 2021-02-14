import { Request } from "express";
import { Controller, UseGuards, Post, Req, Delete } from '@nestjs/common';
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
}
