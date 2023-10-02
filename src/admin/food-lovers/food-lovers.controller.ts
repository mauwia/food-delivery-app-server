import { ObjectId } from 'mongoose';
import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { FoodLoversService } from '../food-lovers/food-lovers.service';
import { FoodLover } from '../../foodLover/foodLover.model';
import { JWTAuthGuard } from "src/foodLover/jwt/jwt-auth.guard";
import { AuthService } from 'src/admin/auth/auth.service';

@Controller()
export class FoodLoversController {
  constructor(
    private readonly adminAuthService: AuthService,
    private readonly adminFoodLoversService: FoodLoversService
  ) {}


  @Get()
  @UseGuards(new JWTAuthGuard())
  async getAllLovers (@Query() queryParams, @Req() { user }): Promise<any> {
    await this.adminAuthService.validateUser(user);
    return await this.adminFoodLoversService.getAllLovers(queryParams);
  }

  @Get('/:id')
  @UseGuards(new JWTAuthGuard())
  async getCreator (@Param('id') id: ObjectId, @Req() { user }): Promise<FoodLover> {
    await this.adminAuthService.validateUser(user);
    return await this.adminFoodLoversService.getLover(id);
  }
}
