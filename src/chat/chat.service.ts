import { Injectable, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Chatroom, Message } from "./chat.model";
import { CHAT_MESSAGES } from './constants/key-constants';
import { ChatGateway } from "./chat.gateway";


@Injectable()
export class ChatService {
  constructor(
    @InjectModel("Chatroom") private readonly chatroomModel: Model<Chatroom>,
    @InjectModel("Message") private readonly messageModel: Model<Message>,
    private readonly chatGatway: ChatGateway
  ) {}
  private logger = new Logger('Chat');

  async createChatroom(reqBody, response) {
    let { foodCreatorId, foodLoverId, orderId }: {
      foodCreatorId: string,
      foodLoverId: string,
      orderId: string,
    } = reqBody;
    try {
      const roomExists = await this.chatroomModel.findOne({
        $and: [
          { foodCreatorId },
          { foodLoverId },
          { orderId }
        ]
      });
      if (roomExists) {
        return response.status(409).json({
          msg: CHAT_MESSAGES.ROOM_EXISTS
        });
      } else {
        const newRoom = new this.chatroomModel(reqBody);
        const chatroom = await this.chatroomModel.create(newRoom);
        this.chatGatway.handleNewRoom(chatroom.orderId, chatroom.id);

        return chatroom;
      }  
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          msg: error,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getChatroomMessages(chatroomId) {
    try {
      const messages = await this.messageModel.find({
        chatroomId: chatroomId
      });
      return messages;
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          msg: error,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
