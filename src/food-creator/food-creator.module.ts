import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodCreatorController } from './food-creator.controller';
import { FoodCreatorService } from './food-creator.service';
import {FoodCreatorSchema} from './food-creator.model'
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { WalletModule } from 'src/wallet/wallet.module';
@Module({
  imports:[
    MongooseModule.forFeature([{name:'FoodCreator',schema:FoodCreatorSchema}]),
    JwtModule.register({
      secret:process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions:{expiresIn:"1h"}
    }),
    WalletModule
  ],
  controllers: [FoodCreatorController],
  providers: [FoodCreatorService]
})
export class FoodCreatorModule {}
