import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticService:AnalyticsService){}
    @Get('/getAnalyticsOfToday')
    async GetAnalyticsOfToday(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfToday(req)
        return response
    }
    @Get('/getAnalyticsOfMonth')
    async GetAnalyticsOfMonth(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfMonth(req)
        return response
    }
    @Get('/getAnalyticsOfWeek')
    async GetAnalyticsOfWeek(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfWeek(req)
        return response
    }
    @Get('/getAnalyticsOfYear')
    async GetAnalyticsOfYear(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfYear(req)
        return response
    }
    @Get('/getAnalyticsOfAllTime')
    async GetAnalyticsOfAllTime(@Req() req:Request){
        let response=await this.analyticService.getAnalyticsOfAllTime(req)
        return response
    }
}
