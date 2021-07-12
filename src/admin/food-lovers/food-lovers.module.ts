import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodLoversController } from './food-lovers.controller';
import { FoodLoversService } from './food-lovers.service';
import { FoodLoverSchema } from '../../foodLover/foodLover.model'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'FoodLover', schema: FoodLoverSchema }]),
  ],
  controllers: [FoodLoversController],
  providers: [FoodLoversService]
})
export class FoodLoversModule {}
