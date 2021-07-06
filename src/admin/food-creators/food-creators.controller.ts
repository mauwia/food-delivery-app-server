import { ObjectId } from 'mongoose';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryParams } from './interfaces';
import { FoodCreatorsService } from '../food-creators/food-creators.service';
import { FoodCreator } from '../../food-creator/food-creator.model';

@Controller()
export class FoodCreatorsController {
  constructor(private readonly adminFoodCreatorsService: FoodCreatorsService) {}

  @Get()
  async getAllCreators (@Query() queryParams: QueryParams): Promise<any> {
    return await this.adminFoodCreatorsService.getAllCreators(queryParams);
  }

  @Get('/:id')
  async getCreator (@Param('id') id: ObjectId): Promise<FoodCreator> {
    return await this.adminFoodCreatorsService.getCreator(id);
  }
}
