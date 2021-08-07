import { ObjectId } from 'mongoose';
import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { FoodLoversService } from '../food-lovers/food-lovers.service';
import { FoodLover } from '../../foodLover/foodLover.model';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class FoodLoversController {
  constructor(private readonly adminFoodLoversService: FoodLoversService) {}


  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllLovers (@Query() queryParams): Promise<any> {
    return await this.adminFoodLoversService.getAllLovers(queryParams);
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  async getCreator (@Param('id') id: ObjectId): Promise<FoodLover> {
    return await this.adminFoodLoversService.getLover(id);
  }
}
