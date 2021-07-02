import { Controller, Get, Query } from '@nestjs/common';
import { FoodCreatorsService } from '../food-creators/food-creators.service';

@Controller()
export class FoodCreatorsController {
  constructor(private readonly adminFoodCreatorsService: FoodCreatorsService) {}

  @Get()
  async getAllLovers (@Query() queryParams) {
    return await this.adminFoodCreatorsService.getAllCreators(queryParams);
  }
}
