import { Request } from "express";
import { Controller, Put, Req, UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from "../foodLover/jwt/jwt-auth.guard";
import { ProfileService } from './profile.service';

@Controller("profile")
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(new JWTAuthGuard())
  @Put('/updateProfile')
  async updateProfile(@Req() request: Request) { 
    const response = await this.profileService.updateProfile(request);
    return response;
  }
}
