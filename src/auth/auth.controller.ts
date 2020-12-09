import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JWTAuthGuard } from "./jwt/jwt-auth.guard";
import { Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signinLover")
  async login(@Req() request: Request) {
    const response = await this.authService.signinLover(request.body);
    return response;
  }

  @Post("/signupLover")
  async signup(@Req() request: Request) {
    const response = await this.authService.signupLover(request.body);
    return response;
  }
  @Post("/forgetPassAuthOTP")
  async ForgetPasswordAuthenticateCode(@Req() request: Request) {
    const response = await this.authService.authenticateOTP_and_forgetPasswordOTP(
      request
    );
    return response;
  }
  @Post("/forgetPasswordOTP")
  async ForgetPasswordOTP(@Req() request: Request) {
    const response = await this.authService.resendOTP_and_forgetPasswordOtp(
      request
    );
    return response;
  }
  @Post("/addNewPassword")
  async AddNewPassword(@Req() request: Request) {
    const response = await this.authService.addNewPassword(request);
    return response;
  }
  @Post("/getUserRegisteredDevice")
  async GetUserRegisteredDevice(@Req() request: Request) {
    const response = await this.authService.getUserRegisteredDevice(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Get("/getLoverInfo")
  async LoverInfo(@Req() request: Request) {
    const response = await this.authService.getLoverInfo(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/authenticateOTP")
  async AuthenticateCode(@Req() request: Request) {
    const response = await this.authService.authenticateOTP_and_forgetPasswordOTP(
      request
    );
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/resendOTP")
  async ResendOTP(@Req() request: Request) {
    const response = await this.authService.resendOTP_and_forgetPasswordOtp(
      request
    );
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/createTransactionPin")
  async CreateTransactionPin(@Req() request: Request) {
    const response = await this.authService.createTransactionPin(request);
    return response;
  }
}
