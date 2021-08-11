import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodCreatorsController } from './food-creators.controller';
import { FoodCreatorsService } from './food-creators.service';
import { FoodCreatorSchema } from '../../food-creator/food-creator.model';
import { OrdersSchema } from '../../orders/orders.model';
import { VerificationDetailSchema } from './verification-detail.model';
import { OrdersService } from '../orders/orders.service';
import { AuthModule } from '../auth/auth.module';
import { MenuSchema } from '../../menu/menu.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FoodCreator', schema: FoodCreatorSchema },
      { name: 'Orders', schema: OrdersSchema },
      { name: 'VerificationDetail', schema: VerificationDetailSchema },
      { name: 'Menu', schema: MenuSchema },
    ]),
    AuthModule,
  ],
  controllers: [FoodCreatorsController],
  providers: [FoodCreatorsService, OrdersService]
})
export class FoodCreatorsModule {}
