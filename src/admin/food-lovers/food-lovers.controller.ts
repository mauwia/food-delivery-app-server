import { ObjectId } from 'mongoose';
import { Controller, Get, Query, Param } from '@nestjs/common';
import { FoodLoversService } from '../food-lovers/food-lovers.service';
import { FoodLover } from '../../foodLover/foodLover.model';

@Controller()
export class FoodLoversController {
  constructor(private readonly adminFoodLoversService: FoodLoversService) {}


  @Get()
  async getAllLovers (@Query() queryParams): Promise<any> {
    return await this.adminFoodLoversService.getAllLovers(queryParams);
  }

  @Get('/:id')
  async getCreator (@Param('id') id: ObjectId): Promise<FoodLover> {
    return await this.adminFoodLoversService.getLover(id);
  }
}
