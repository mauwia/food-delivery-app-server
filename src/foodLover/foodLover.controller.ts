import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { FoodLoverService } from "./foodLover.service";
import { JWTAuthGuard } from "./jwt/jwt-auth.guard";
import { Request } from "express";

@Controller("foodLover")
export class FoodLoverController {
  constructor(private readonly foodLoverService: FoodLoverService) {}

  @Post("/signinLover")
  async login(@Req() request: Request) {
    const response = await this.foodLoverService.signinLover(request.body);
    return response;
  }

  @Post("/signupLover")
  async signup(@Req() request: Request) {
    const response = await this.foodLoverService.signupLover(request.body);
    return response;
  }
  @Post("/forgetPassAuthOTP")
  async ForgetPasswordAuthenticateCode(@Req() request: Request) {
    const response = await this.foodLoverService.authenticateOTP_and_forgetPasswordOTP(
      request
    );
    return response;
  }
  @Post("/forgetPasswordOTP")
  async ForgetPasswordOTP(@Req() request: Request) {
    const response = await this.foodLoverService.resendOTP_and_forgetPasswordOtp(
      request
    );
    return response;
  }
  @Post("/addNewPassword")
  async AddNewPassword(@Req() request: Request) {
    const response = await this.foodLoverService.addNewPassword(request);
    return response;
  }
  @Post("/getUserRegisteredDevice")
  async GetUserRegisteredDevice(@Req() request: Request) {
    const response = await this.foodLoverService.getUserRegisteredDevice(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Get("/getLoverInfo")
  async LoverInfo(@Req() request: Request) {
    const response = await this.foodLoverService.getLoverInfo(request);
    return response;
  }
  @Get("/getLoverInfo/:username")
  async otherLoverInfo(@Req() request: Request) {
    const response = await this.foodLoverService.getLoverInfo(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/authenticateOTP")
  async AuthenticateCode(@Req() request: Request) {
    const response = await this.foodLoverService.authenticateOTP_and_forgetPasswordOTP(
      request
    );
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/resendOTP")
  async ResendOTP(@Req() request: Request) {
    const response = await this.foodLoverService.resendOTP_and_forgetPasswordOtp(
      request
    );
    return response;
  }
  @UseGuards(new JWTAuthGuard())  
  @Post("/verifyPin")
  async VerifyPin(@Req() request:Request){
    const response=await this.foodLoverService.verifyPin(request)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/createTransactionPin")
  async CreateTransactionPin(@Req() request: Request) {
    const response = await this.foodLoverService.createTransactionPin(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/logout")
  async Logout(@Req() request:Request){
    const response=await this.foodLoverService.logout(request)
    return response
  }
}
