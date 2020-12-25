import { Controller, Post,Req } from '@nestjs/common';
import { request, Request } from "express";
import { FoodCreatorService } from './food-creator.service';

@Controller('foodCreator')
export class FoodCreatorController {
    constructor(private readonly foodCreatorService:FoodCreatorService){}
    @Post('/signinCreator')
    async login(@Req() request:Request){
        let response=await this.foodCreatorService.signinCreator(request.body)
        return response
    }
    @Post("/signupCreator")
    async signup(@Req() request:Request){
        let response=await this.foodCreatorService.signupCreator(request.body)
        return response
    }
}
