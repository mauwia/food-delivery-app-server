import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import {OrdersSchema} from './orders.model'
import { FoodLoverSchema } from 'src/foodLover/foodLover.model';

@Module({
  imports:[MongooseModule.forFeature([{name:"Orders",schema:OrdersSchema},{name:"FoodLover",schema:FoodLoverSchema}])],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
