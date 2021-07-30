import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from './notification.model';
import { FoodCreatorSchema } from 'src/food-creator/food-creator.model';
import { FoodLoverSchema } from 'src/foodLover/foodLover.model';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports:[
    MongooseModule.forFeature([
        {name:"Notification",schema:NotificationSchema},
        { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema }
    ])
  ],
  providers: [NotificationService,NotificationGateway],
  controllers: [NotificationController],
  exports:[NotificationService]
})
export class NotificationModule {}
