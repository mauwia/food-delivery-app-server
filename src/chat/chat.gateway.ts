import { 
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer } from '@nestjs/websockets';
import { Logger, HttpStatus, HttpException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Message } from "./chat.model";
import { CHAT_MESSAGES } from './constants/key-constants';


@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection  {
  constructor(
    @InjectModel("Message") private readonly messageModel: Model<Message>,
    @InjectModel("Chatroom") private readonly chatroomModel: Model<Message>,
  ) {}
  socket_id: any;
  users: any[] = [];
  onlineUsers: { [key: string]: any } = {};
  activeChats: { [key: string]: any } = {};
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway')

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }
  handleDisconnect(client: Socket) {
    delete this.onlineUsers[client.handshake.query.userNo]
    this.logger.log(`Client disconnected: ${client.id}`);
    console.log(this.onlineUsers);
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected to chat: ${client.id}`);
    let {userNo}=client.handshake.query
    this.onlineUsers[userNo] = { phoneNo:userNo, socketId: client.id };
    // this.server
    //   .to(client.id)
    //   .emit('new-client-id', client.id);   
  }

  handleNewRoom(orderId: string, roomId: string): void {
    console.log(orderId,this.activeChats)
    this.server
      .to(this.activeChats[orderId].socketId)
      .emit('chat-room-id', roomId);
    }

  @SubscribeMessage('new-chat-room')
  setActiveChat(client: Socket, payload): void {
    console.log(payload)
    this.activeChats[payload.orderId] = { ...payload, socketId: client.id };
    console.log(this.activeChats)
  }

  @SubscribeMessage('chat-to-server')
  async handleMessage(client: Socket, payload: {
    senderId: string,
    receiverId: string,
    chatroomId: string,
    message: string,
    orderId: string,
    isFoodCreatorMessage: boolean }) {
    try {
      // check that chatroom has been created in the DB
      const chatroom = this.chatroomModel.findOne({
        _id: payload.chatroomId
      });
      if(chatroom) {
        // check that chatroom is currently active
        const roomIsActive = this.activeChats[payload.orderId];
        if (roomIsActive) {
          const newMessage = new this.messageModel(payload);
          const message = await this.messageModel.create(newMessage);      
          this.server
            .to(client.id)
            .emit('chat-to-client', message);

          return message;
        } else {
          this.server
            .to(client.id)
            .emit('error-sending-chat', {
              message: CHAT_MESSAGES.CHATROOM_NOT_ACTIVE,
              orderId: payload.orderId
            });
        }
      } 
    } catch (error) {
      this.logger.error(error.message);
      if(error.message.includes('Message validation failed: chatroomId: Cast to ObjectId failed')) {
        console.log('Chat room does not esist')
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            msg: CHAT_MESSAGES.CHATROOM_NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          msg: error,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, orderId: string) {
    const chatroomId = this.activeChats[orderId].chatroomId;

    client.join(chatroomId);
    client.emit('joined-room', chatroomId)
  }

  @SubscribeMessage('end-chat')
  handleEndChat(client: Socket, payload: { orderId: string, chatroomId: string }) {
    const { [payload.orderId]: endedChat, ...updatedActiveChats } = this.activeChats; 

    this.activeChats = updatedActiveChats;
    client.emit('chat-ended', {
      orderId: endedChat.orderId,
      chatroomId: payload.chatroomId
    });
  }
}
