import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGateway } from './admin.gateway';
import { FoodLoversModule } from './food-lovers/food-lovers.module';
import { FoodCreatorsModule } from './food-creators/food-creators.module';
import { AdminNotificationModule } from './admin-notification/admin-notification.module'
import { OrdersModule } from './orders/orders.module';
// import { AuthModule } from './auth-stash/auth.module';
// import { UsersModule } from './users/users.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminGateway],
  imports: [
    FoodLoversModule,
    FoodCreatorsModule,
    AdminNotificationModule,
    OrdersModule,
    // AuthModule,
    // UsersModule
  ],
  exports: [AdminGateway],
})
export class AdminModule {}
