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
  Req,
} from '@nestjs/common';
import { QueryParams } from './interfaces';
import { FoodCreatorsService } from '../food-creators/food-creators.service';
import { FoodCreator } from '../../food-creator/food-creator.model';
import { VerificationDetail } from './verification-detail.model';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JWTAuthGuard } from "src/foodLover/jwt/jwt-auth.guard";
import { AuthService } from 'src/admin/auth/auth.service';

@Controller()
export class FoodCreatorsController {
  constructor(
    private readonly adminAuthService: AuthService,
    private readonly adminFoodCreatorsService: FoodCreatorsService
  ) {}

  @Get()
  @UseGuards(new JWTAuthGuard())
  async getAllCreators (@Query() queryParams: QueryParams, @Req() { user }): Promise<any> {
    await this.adminAuthService.validateUser(user);
    return await this.adminFoodCreatorsService.getAllCreators(queryParams);
  }

  @Get('/:param')
  @UseGuards(new JWTAuthGuard())
  async getCreatorsByIdOrParam (@Query() queryParams, @Param('param') param, @Req() { user }): Promise<any> {
    const validVerificationStatus = ['pending', 'ongoing', 'completed', 'suspended'];  
    await this.adminAuthService.validateUser(user);

    if (Types.ObjectId.isValid(param)) {
      return await this.adminFoodCreatorsService.getCreator(param);
    } else if (validVerificationStatus.includes(param.toLowerCase())) {
      return await this.adminFoodCreatorsService.getCreatorsByVerificationStatus(queryParams, param);     
    }
  }

  @Patch('/:id/status')
  @UseGuards(new JWTAuthGuard())
  async updateVerificationStatus (@Param('id') id, @Body('status') newStatus, @Req() { user }): Promise<FoodCreator> {
    await this.adminAuthService.validateUser(user);
    return await this.adminFoodCreatorsService.updateVerificationStatus(id, newStatus);
  }

  @Patch('/:id/stage')
  @UseGuards(new JWTAuthGuard())
  async updateVerificationStage (@Param('id') id, @Body('stage') newStage, @Req() { user }): Promise<FoodCreator> {
    await this.adminAuthService.validateUser(user);
    return await this.adminFoodCreatorsService.updateVerificationStage(id, newStage);
  }

  @Get('/metrics/all')
  @UseGuards(new JWTAuthGuard())
  async getCreatorsMetrics (@Req() { user }) {
    await this.adminAuthService.validateUser(user);
    return await this.adminFoodCreatorsService.getCreatorsMetrics();
  }

  @Post('/:id/kyc/new')
  @UseGuards(new JWTAuthGuard())
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'contactPersonGovId', maxCount: 1 },
  ]))
  async addVerificationDetails(
    @Req() { user },
    @Body() kycData,
    @Param('id') id: ObjectId,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    await this.adminAuthService.validateUser(user);
    return await this.adminFoodCreatorsService.addKycData(id, kycData, files);
  }

  @Get('/:id/kyc/view')
  @UseGuards(new JWTAuthGuard())
  async getKycDetails (@Param('id') id, @Req() { user }): Promise<VerificationDetail> {
    await this.adminAuthService.validateUser(user);
    return await this.adminFoodCreatorsService.getKycData(id);
  }
}
