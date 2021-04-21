import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { EarlyRegisterationController } from './early-registeration.controller';
import { EarlyRegisterationService } from './early-registeration.service';
import {EarlyRegisterationModel} from './early-registeration.model'

@Module({
  imports:[MongooseModule.forFeature([
    {name:'EarlyRegisteration',schema:EarlyRegisterationModel}
  ])],
  controllers: [EarlyRegisterationController],
  providers: [EarlyRegisterationService]
})
export class EarlyRegisterationModule {}
