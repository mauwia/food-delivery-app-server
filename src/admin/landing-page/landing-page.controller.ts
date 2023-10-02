import { Controller, Get, Req, Response, UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from "src/foodLover/jwt/jwt-auth.guard";
import { Response as Res } from 'express';
import { AuthService } from 'src/admin/auth/auth.service';
import { LandingPageService } from 'src/admin/landing-page/landing-page.service';
import { Header } from '@nestjs/common';

@Controller()
export class LandingPageController {
  constructor(
    private readonly adminAuthService: AuthService,
    private readonly landingPageService: LandingPageService,
  ) {}

  @Get('/all')
  @Header('Content-Type','text/xlsx')
  @Header('Access-Control-Expose-Headers','X-Suggested-Filename')
  @UseGuards(new JWTAuthGuard())
  async getBetaUsers (@Req() { user }, @Response() res: Res) {
    await this.adminAuthService.validateUser(user);
    const date = new Date(Date.now());
    const uniqueDateTime = (
      date.toLocaleDateString('en-GB') + '-' + date.toLocaleTimeString('en-GB')
    ).replace(/\/|:/g, "-");

    const workbook = await this.landingPageService.getBetaUsers(user);
    res.set({
      "X-Suggested-Filename": `beta-users-${uniqueDateTime}.xlsx`,
    });
    return workbook.xlsx.write(res);
  }
}
