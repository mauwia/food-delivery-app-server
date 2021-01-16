import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  FoodCreatorSchema,
} from "src/food-creator/food-creator.model";
import { FoodLoverSchema } from "src/foodLover/foodLover.model";
import { MenuController } from "./menu.controller";
import { MenuItemSchema, MenuSchema } from "./menu.model";
import { MenuService } from "./menu.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Menu", schema: MenuSchema },
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
      { name: "MenuItems", schema: MenuItemSchema },
    ]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
