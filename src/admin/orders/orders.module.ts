import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersSchema } from 'src/orders/orders.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Orders', schema: OrdersSchema },
    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrdersModule {}
