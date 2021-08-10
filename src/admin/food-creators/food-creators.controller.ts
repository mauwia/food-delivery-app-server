import { ObjectId, Types } from 'mongoose';
import {
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  Controller,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { QueryParams } from './interfaces';
import { FoodCreatorsService } from '../food-creators/food-creators.service';
import { FoodCreator } from '../../food-creator/food-creator.model';
import { VerificationDetail } from './verification-detail.model';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class FoodCreatorsController {
  constructor(private readonly adminFoodCreatorsService: FoodCreatorsService) {}

  @Get()
  // @UseGuards(AuthGuard('jwt'))
  async getAllCreators (@Query() queryParams: QueryParams): Promise<any> {
    return await this.adminFoodCreatorsService.getAllCreators(queryParams);
  }

  @Get('/:param')
  // @UseGuards(AuthGuard('jwt'))
  async getCreatorsByIdOrParam (@Query() queryParams, @Param('param') param): Promise<any> {
    const validVerificationStatus = ['pending', 'ongoing', 'completed', 'suspended']
    
    if (Types.ObjectId.isValid(param)) {
      return await this.adminFoodCreatorsService.getCreator(param);
    } else if (validVerificationStatus.includes(param.toLowerCase())) {
      return await this.adminFoodCreatorsService.getCreatorsByVerificationStatus(queryParams, param);     
    }
  }

  @Patch('/:id/status')
  // @UseGuards(AuthGuard('jwt'))
  async updateVerificationStatus (@Param('id') id, @Body('status') newStatus): Promise<FoodCreator> {
    return await this.adminFoodCreatorsService.updateVerificationStatus(id, newStatus);
  }

  @Patch('/:id/stage')
  // @UseGuards(AuthGuard('jwt'))
  async updateVerificationStage (@Param('id') id, @Body('stage') newStage): Promise<FoodCreator> {
    return await this.adminFoodCreatorsService.updateVerificationStage(id, newStage);
  }

  @Get('/metrics/all')
  // @UseGuards(AuthGuard('jwt'))
  async getCreatorsMetrics () {
    return await this.adminFoodCreatorsService.getCreatorsMetrics();
  }

  @Post('/:id/kyc/new')
  // @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'contactPersonGovId', maxCount: 1 },
  ]))
  async addVerificationDetails(
    @Body() kycData,
    @Param('id') id: ObjectId,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return await this.adminFoodCreatorsService.addKycData(id, kycData, files);
  }

  @Get('/:id/kyc/view')
  // @UseGuards(AuthGuard('jwt'))
  async getKycDetails (@Param('id') id): Promise<VerificationDetail> {
    return await this.adminFoodCreatorsService.getKycData(id);
  }
}
