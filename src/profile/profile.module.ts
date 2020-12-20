import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { MongooseModule } from "@nestjs/mongoose";
import { FoodLoverSchema } from "../foodLover/foodLover.model";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "FoodLover", schema: FoodLoverSchema },
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}
