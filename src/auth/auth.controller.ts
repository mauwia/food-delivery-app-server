import { Controller, Get, Post, Req,UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {JWTAuthGuard} from './jwt/jwt-auth.guard'
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('/signinLover')
  async login(
  @Req() request:Request ) {
      const response= await this.authService.signinLover(request.body);
      return response
}

@Post('/signupLover')
  async signup(
  @Req() request:Request ) {
      const response= await this.authService.signupLover(request.body);
      return response
}
@UseGuards(new JWTAuthGuard())
@Get('/getLoverInfo')
async LoverInfo(@Req() request:Request){
      const response=await this.authService.getLoverInfo(request)
      return response
}


}
