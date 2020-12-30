import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import {OrdersSchema} from './orders.model'
import { FoodLoverSchema } from 'src/foodLover/foodLover.model';
import { FoodCreatorSchema } from 'src/food-creator/food-creator.model';

@Module({
  imports:[MongooseModule.forFeature([{name:"Orders",schema:OrdersSchema},{name:"FoodLover",schema:FoodLoverSchema},{name:"FoodCreator",schema:FoodCreatorSchema}])],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
