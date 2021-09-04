import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { MongooseModule } from "@nestjs/mongoose";
import { FoodLoverSchema } from "../foodLover/foodLover.model";
import { FoodCreatorSchema } from "../food-creator/food-creator.model";
import { OrdersSchema } from 'src/orders/orders.model';
import { TestersSchema } from './profile.model';
import { AdminModule } from "src/admin/admin.module";
import { AdminNotificationModule } from "src/admin/admin-notification/admin-notification.module";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
      {name:"Orders",schema:OrdersSchema},
      {name:"Testers",schema:TestersSchema}
    ], 'noshify'),
    AdminNotificationModule,
    AdminModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}
