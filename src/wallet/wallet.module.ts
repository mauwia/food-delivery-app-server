import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt/dist/jwt.module";
import { WalletController } from "./wallet.controller";
import { TransactionsSchema, WalletSchema } from "./wallet.model";
import { WalletService } from "./wallet.service";
import { JwtStrategy } from "../foodLover/jwt/jwt.strategy";
import { FoodLoverSchema} from "../foodLover/foodLover.model";
import { AppGateway } from "../app.gateway";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Wallet", schema: WalletSchema },
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "Transactions", schema: TransactionsSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [WalletController],
  providers: [WalletService, JwtStrategy,AppGateway],
  exports: [WalletService],
})
export class WalletModule {}
