import { Controller, Get, Req,UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JWTAuthGuard } from 'src/foodLover/jwt/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticService:AnalyticsService){}
    // @UseGuards(new JWTAuthGuard())
    @Get('/getAnalyticsOfToday')
    async GetAnalyticsOfToday(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfToday(req)
        return response
    }
    @UseGuards(new JWTAuthGuard())
    @Get('/getAnalyticsOfMonth')
    async GetAnalyticsOfMonth(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfMonth(req)
        return response
    }
    @UseGuards(new JWTAuthGuard())
    @Get('/getAnalyticsOfWeek')
    async GetAnalyticsOfWeek(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfWeek(req)
        return response
    }
    @Get('/getAnalyticsOfYear')
    @UseGuards(new JWTAuthGuard())
    async GetAnalyticsOfYear(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfYear(req)
        return response
    }
    @Get('/getAnalyticsOfAllTime')
    @UseGuards(new JWTAuthGuard())
    async GetAnalyticsOfAllTime(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfAllTime(req)
        return response
    }
}
