import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { FoodLoverSchema } from '../../foodLover/foodLover.model';
import { OrdersSchema } from '../../orders/orders.model';
import { AuthModule } from '../auth/auth.module';
import { OrdersService } from '../orders/orders.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FoodLover', schema: FoodLoverSchema },
      { name: 'Orders', schema: OrdersSchema },
    ]),
    AuthModule,
  ],
  providers: [AnalyticsService, OrdersService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule {}
