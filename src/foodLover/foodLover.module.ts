import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { FoodLoverController } from "./foodLover.controller";
import { FoodLoverService } from "./foodLover.service";
import { FoodLoverSchema } from "./foodLover.model";
import { JwtModule } from "@nestjs/jwt/dist/jwt.module";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { WalletModule } from "../wallet/wallet.module";
import { FoodCreatorSchema } from "src/food-creator/food-creator.model";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "FoodLover", schema: FoodLoverSchema},{name:"FoodCreator",schema:FoodCreatorSchema}]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
    WalletModule,
  ],
  controllers: [FoodLoverController],
  providers: [FoodLoverService, JwtStrategy],
})
export class FoodLoverModule {}
