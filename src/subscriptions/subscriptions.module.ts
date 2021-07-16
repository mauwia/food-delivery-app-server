import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { MongooseModule } from "@nestjs/mongoose";
import { FoodLoverSchema } from "../foodLover/foodLover.model";
import { FoodCreatorSchema } from "../food-creator/food-creator.model";
import { NotificationModule } from 'src/notification/notification.module';
import { SubscriptionGateway } from './subscription.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
    ]),
    NotificationModule
  ],

  controllers: [SubscriptionsController],
  providers: [SubscriptionsService,SubscriptionGateway]
})
export class SubscriptionsModule {}
