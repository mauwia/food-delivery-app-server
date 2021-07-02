import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FoodCreatorsModule } from './food-creators/food-creators.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [FoodCreatorsModule]
})
export class AdminModule {}
