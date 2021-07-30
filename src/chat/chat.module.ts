import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatroomSchema, MessageSchema } from "./chat.model";
import { OrdersSchema } from 'src/orders/orders.model';
import { FoodLoverSchema } from 'src/foodLover/foodLover.model';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationModule } from 'src/notification/notification.module';
import { FoodCreatorSchema } from 'src/food-creator/food-creator.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Chatroom", schema: ChatroomSchema },
      {name:"FoodLover",schema:FoodLoverSchema},
      { name: "Message", schema: MessageSchema },
      {name:"Orders",schema:OrdersSchema},
      {name:"FoodCreator",schema:FoodCreatorSchema}
    ]),NotificationModule
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports:[ChatService]
})
export class ChatModule {}
