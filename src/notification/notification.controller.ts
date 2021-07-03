import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from 'src/foodLover/jwt/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { request, Request } from "express";

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @UseGuards(new JWTAuthGuard())
    @Get('/fl/:page')
    async GetFlNotification(@Req() request:Request){
        let response=await this.notificationService.getNotificationsFL(request)
        return response
    }
  @UseGuards(new JWTAuthGuard())    
    @Get('/fc/:page')
    async GetFcNotification(@Req() request:Request){
        let response=await this.notificationService.getNotificationsFC(request)
        return response
    }

}
