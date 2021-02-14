import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { MongooseModule } from "@nestjs/mongoose";
import { FoodLoverSchema } from "../foodLover/foodLover.model";
import { FoodCreatorSchema } from "../food-creator/food-creator.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService]
})
export class SubscriptionsModule {}
