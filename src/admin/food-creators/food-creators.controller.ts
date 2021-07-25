import { Types } from 'mongoose';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { QueryParams } from './interfaces';
import { FoodCreatorsService } from '../food-creators/food-creators.service';
import { FoodCreator } from '../../food-creator/food-creator.model';
import { VerificationDetail } from './verification-detail.model';

@Controller()
export class FoodCreatorsController {
  constructor(private readonly adminFoodCreatorsService: FoodCreatorsService) {}

  @Get()
  async getAllCreators (@Query() queryParams: QueryParams): Promise<any> {
    return await this.adminFoodCreatorsService.getAllCreators(queryParams);
  }

  @Get('/:param')
  async getCreatorsByIdOrParam (@Query() queryParams, @Param('param') param): Promise<any> {
    const validVerificationStatus = ['pending', 'ongoing', 'completed', 'suspended']
    
    if (Types.ObjectId.isValid(param)) {
      return await this.adminFoodCreatorsService.getCreator(param);
    } else if (validVerificationStatus.includes(param.toLowerCase())) {
      return await this.adminFoodCreatorsService.getCreatorsByVerificationStatus(queryParams, param);     
    }
  }

  @Patch('/:id/status')
  async updateVerificationStatus (@Param('id') id, @Body('status') newStatus): Promise<FoodCreator> {
    return await this.adminFoodCreatorsService.updateVerificationStatus(id, newStatus);
  }

  @Patch('/:id/stage')
  async updateVerificationStage (@Param('id') id, @Body('stage') newStage): Promise<FoodCreator> {
    return await this.adminFoodCreatorsService.updateVerificationStage(id, newStage);
  }

  @Get('/metrics/all')
  async getCreatorsMetrics () {
    return await this.adminFoodCreatorsService.getCreatorsMetrics();
  }

  @Post('/:id/kyc/new')
  async addVerificationDetails(@Param('id') id, @Body('kycData') kycData): Promise<VerificationDetail> {
    return await this.adminFoodCreatorsService.addKycData(id, kycData);
  }

  @Get('/:id/kyc/view')
  async getKycDetails (@Param('id') id): Promise<VerificationDetail> {
    return await this.adminFoodCreatorsService.getKycData(id);
  }
}
