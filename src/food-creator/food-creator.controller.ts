import { Controller, Get, Post,Req, UseGuards } from '@nestjs/common';
import { request, Request } from "express";
import { JWTAuthGuard } from '../foodLover/jwt/jwt-auth.guard';
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
    @Post("/forgetPassAuthOTP")
    async ForgetPasswordAuthenticateCode(@Req() request: Request) {
      const response = await this.foodCreatorService.authenticateOTP_and_forgetPasswordOTP(
        request
      );
      return response;
    }
    @Post("/forgetPasswordOTP")
    async ForgetPasswordOTP(@Req() request: Request) {
      const response = await this.foodCreatorService.resendOTP_and_forgetPasswordOtp(
        request
      );
      return response;
    }
    @Post("/addNewPassword")
  async AddNewPassword(@Req() request: Request) {
    const response = await this.foodCreatorService.addNewPassword(request);
    return response;
  }
  @Post("/getUserRegisteredDevice")
  async GetUserRegisteredDevice(@Req() request: Request) {
    const response = await this.foodCreatorService.getUserRegisteredDevice(request);
    return response;
  }
  @UseGuards (new JWTAuthGuard())
  @Get("/getCreatorInfo")
  async getCreatorInfo(@Req() request:Request){
    const response = await this.foodCreatorService.getCreatorInfo(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/authenticateOTP")
  async AuthenticateCode(@Req() request: Request) {
    const response = await this.foodCreatorService.authenticateOTP_and_forgetPasswordOTP(
      request
    );
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/resendOTP")
  async ResendOTP(@Req() request: Request) {
    const response = await this.foodCreatorService.resendOTP_and_forgetPasswordOtp(
      request
    );
    return response;
  }
  @UseGuards(new JWTAuthGuard())  
  @Post("/verifyPin")
  async VerifyPin(@Req() request:Request){
    const response=await this.foodCreatorService.verifyPin(request)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/createTransactionPin")
  async CreateTransactionPin(@Req() request: Request) {
    const response = await this.foodCreatorService.createTransactionPin(request);
    return response;
  }
}
