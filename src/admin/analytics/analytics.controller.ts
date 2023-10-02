import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from 'src/admin/analytics/analytics.service';
import { FoodLover } from '../../foodLover/foodLover.model';
import { JWTAuthGuard } from "src/foodLover/jwt/jwt-auth.guard";
import { AuthService } from 'src/admin/auth/auth.service';

@Controller()
export class AnalyticsController {
  constructor(
    private readonly adminAuthService: AuthService,
    private readonly analyticsService: AnalyticsService
  ) {}

  @Get('food-lovers/all')
  @UseGuards(new JWTAuthGuard())
  async getFoodLoversMetrics (@Req() { user }) {
    await this.adminAuthService.validateUser(user);
    return await this.analyticsService.getLoversMetrics();
  }

  @Get('/food-creators/all')
  @UseGuards(new JWTAuthGuard())
  async getCreatorsMetrics (@Req() { user }) {
    await this.adminAuthService.validateUser(user);
    return await this.analyticsService.getCreatorsMetrics();
  }
}
