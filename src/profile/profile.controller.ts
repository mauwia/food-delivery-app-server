import { Request, Response } from "express";
import { Controller, Put, Req, UseGuards, Patch, Query, Res } from '@nestjs/common';
import { JWTAuthGuard } from "../foodLover/jwt/jwt-auth.guard";
import { ProfileService } from './profile.service';

@Controller("profile")
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(new JWTAuthGuard())
  @Put('/updateProfile')
  async updateProfile(@Req() req: Request, @Res() res: Response, @Query() query) {
    const response = await this.profileService.updateProfile(req, res, query);
    return response;
  }

  @UseGuards(new JWTAuthGuard())
  @Patch('/updatePassword')
  async updatePassword(@Req() req: Request, @Res() res: Response, @Query() query) { 
    const response = await this.profileService.updatePassword(req, res, query);
    return response;
  }
}
