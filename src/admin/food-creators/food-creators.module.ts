import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodCreatorsController } from './food-creators.controller';
import { FoodCreatorsService } from './food-creators.service';
import { FoodCreatorSchema } from '../../food-creator/food-creator.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'FoodCreator', schema: FoodCreatorSchema }]),
  ],
  controllers: [FoodCreatorsController],
  providers: [FoodCreatorsService]
})
export class FoodCreatorsModule {}
