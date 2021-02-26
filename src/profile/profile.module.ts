import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { MongooseModule } from "@nestjs/mongoose";
import { FoodLoverSchema } from "../foodLover/foodLover.model";
import { FoodCreatorSchema } from "../food-creator/food-creator.model";
import { OrdersSchema } from 'src/orders/orders.model';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
      {name:"Orders",schema:OrdersSchema}
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}
