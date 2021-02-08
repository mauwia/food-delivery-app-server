import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { OrdersSchema } from "./orders.model";
import { FoodLoverSchema } from "src/foodLover/foodLover.model";
import { FoodCreatorSchema } from "src/food-creator/food-creator.model";
import { OrdersGateway } from "./orders.gateway";
import { WalletSchema } from "src/wallet/wallet.model";
import { WalletModule } from "src/wallet/wallet.module";
import { ChatModule } from "src/chat/chat.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Orders", schema: OrdersSchema },
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
      { name: "Wallet", schema: WalletSchema },
    ]),
    WalletModule,ChatModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
