import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FoodLoversModule } from './food-lovers/food-lovers.module';
import { FoodCreatorsModule } from './food-creators/food-creators.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [FoodLoversModule, FoodCreatorsModule]
})
export class AdminModule {}
