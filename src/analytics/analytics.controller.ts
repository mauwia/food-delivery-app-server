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
}
