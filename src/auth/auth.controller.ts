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
  @UseGuards(new JWTAuthGuard())
  @Get("/getLoverInfo")
  async LoverInfo(@Req() request: Request) {
    const response = await this.authService.getLoverInfo(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/authenticateOTP")
  async AuthenticateCode(@Req() request: Request) {
    const response = await this.authService.authenticateOTP(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/resendOTP")
  async ResendOTP(@Req() request: Request) {
    const response = await this.authService.resendOTP(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/addNewPassword")
  async AddNewPassword(@Req() request: Request) {
    const response = await this.authService.addNewPassword(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Get("/getUserRegisteredDevice")
  async GetUserRegisteredDevice(@Req() request: Request) {
    const response = await this.authService.getUserRegisteredDevice(request);
    return response;
  }
}
