import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatroomSchema, MessageSchema } from "./chat.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Chatroom", schema: ChatroomSchema },
      { name: "Message", schema: MessageSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
