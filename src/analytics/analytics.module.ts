import { Module } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { OrdersSchema } from "src/orders/orders.model";
import { FoodCreatorSchema } from "src/food-creator/food-creator.model";
import { ReviewSchema } from "src/review/review.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Orders", schema: OrdersSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
      { name: "Reviews", schema: ReviewSchema },
    ], 'noshify'),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
