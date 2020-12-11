import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt/dist/jwt.module";
import { WalletController } from "./wallet.controller";
import { TransactionsSchema, WalletSchema } from "./wallet.model";
import { WalletService } from "./wallet.service";
import { JwtStrategy } from "src/auth/jwt/jwt.strategy";
import { AuthSchema } from "src/auth/auth.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Wallet", schema: WalletSchema },
      { name: "Auth", schema: AuthSchema },
      { name: "Transactions", schema: TransactionsSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [WalletController],
  providers: [WalletService, JwtStrategy],
  exports: [WalletService],
})
export class WalletModule {}
