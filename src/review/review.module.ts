import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FoodCreatorSchema } from "src/food-creator/food-creator.model";
import { FoodLoverSchema } from "src/foodLover/foodLover.model";
import { MenuItemSchema } from "src/menu/menu.model";
import { OrdersSchema } from "src/orders/orders.model";
import { ReviewController } from "./review.controller";
import { ReviewSchema } from "./review.model";
import { ReviewService } from "./review.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Reviews", schema: ReviewSchema },
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
      { name: "MenuItems", schema: MenuItemSchema },
      { name: "Orders", schema: OrdersSchema },
    ], 'noshify'),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
