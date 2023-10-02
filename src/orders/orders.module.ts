import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import {
  OrdersSchema,
  orderFoodSchema,
  noshifyCentralSchema,
} from "./orders.model";
import { FoodLoverSchema } from "src/foodLover/foodLover.model";
import { FoodCreatorSchema } from "src/food-creator/food-creator.model";
import { OrdersGateway } from "./orders.gateway";
import { WalletSchema } from "src/wallet/wallet.model";
import { WalletModule } from "src/wallet/wallet.module";
import { ChatModule } from "src/chat/chat.module";
import { MenuItemSchema } from "src/menu/menu.model";
import { ReviewSchema } from "src/review/review.model";
import { NotificationModule } from "src/notification/notification.module";
import { AdminModule } from "src/admin/admin.module";
import { AdminNotificationModule } from "src/admin/admin-notification/admin-notification.module";
import { AdminNotificationSchema } from "src/admin/admin-notification/admin-notifications.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "NoshifyCentral", schema: noshifyCentralSchema },
      { name: "Orders", schema: OrdersSchema },
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
      { name: "Wallet", schema: WalletSchema },
      { name: "MenuItems", schema: MenuItemSchema },
      { name: "OrderedFood", schema: orderFoodSchema },
      { name: "Reviews", schema: ReviewSchema },
      { name: "AdminNotification", schema: AdminNotificationSchema },
    ], 'noshify'),
    WalletModule,
    ChatModule,
    NotificationModule,
    AdminModule,
    AdminNotificationModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
