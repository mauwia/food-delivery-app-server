import { Request } from "express";
import { Controller, Put, Req, UseGuards, Patch, Query } from '@nestjs/common';
import { JWTAuthGuard } from "../foodLover/jwt/jwt-auth.guard";
import { ProfileService } from './profile.service';

@Controller("profile")
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(new JWTAuthGuard())
  @Put('/updateProfile')
  async updateProfile(@Req() req: Request, @Query() query) {
    const response = await this.profileService.updateProfile(req, query);
    return response;
  }

  @UseGuards(new JWTAuthGuard())
  @Patch('/updatePassword')
  async updatePassword(@Req() req: Request, @Query() query) { 
    const response = await this.profileService.updatePassword(req, query);
    return response;
  }
}
