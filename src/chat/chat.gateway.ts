import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger, HttpStatus, HttpException } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Chatroom, Message } from "./chat.model";
import { CHAT_MESSAGES } from "./constants/key-constants";
import * as admin from "firebase-admin";
import { FoodLover } from "src/foodLover/foodLover.model";
import getNumberOfFLChats from "./constants/getNumberOfFLChats";

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    @InjectModel("Message") private readonly messageModel: Model<Message>,
    @InjectModel("Chatroom") private readonly chatroomModel: Model<Chatroom>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>
  ) {}
  socket_id: any;
  users: any[] = [];
  onlineUsers: { [key: string]: any } = {};
  activeChats: { [key: string]: any } = {};
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("ChatGateway");

  afterInit(server: any) {
    this.logger.log("Initialized!");
  }

  async handleDisconnect(client: Socket) {
    let { userNo } = client.handshake.query;
    await this.foodLoverModel.findOneAndUpdate(
      { phoneNo: userNo },
      {
        $set: {
          isActive: false,
        },
      }
    );
    //this pipeline will use to get numbers of FC which are in active chat with FL
    let getNumbersPipeline = getNumberOfFLChats(client);
    let numbers = await this.foodLoverModel.aggregate(getNumbersPipeline);
    if (numbers.length) {
      numbers[0].phoneNo.map((phone) => {
        if (this.onlineUsers[phone]) {
          this.server
            .to(this.onlineUsers[phone].socketId)
            .emit("fl-user-status", {
              phoneNo: client.handshake.query.userNo,
              statusOnline: false,
            });
        }
      });
    }
    if (this.onlineUsers[client.handshake.query.userNo]) {
      delete this.onlineUsers[client.handshake.query.userNo];
    }
    this.logger.log(`Client disconnected: ${client.id}`);
    // console.log(this.onlineUsers);
  }
  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected to chat: ${client.id}`);
    let { userNo } = client.handshake.query;
    await this.foodLoverModel.findOneAndUpdate(
      { phoneNo: userNo },
      {
        $set: {
          isActive: true,
        },
      }
    );
    this.onlineUsers[userNo] = { phoneNo: userNo, socketId: client.id };
    let getNumbersPipeline = getNumberOfFLChats(client);
    let numbers = await this.foodLoverModel.aggregate(getNumbersPipeline);
    if (numbers.length) {
      numbers[0].phoneNo.map((phone) => {
        if (this.onlineUsers[phone]) {
          this.server
            .to(this.onlineUsers[phone].socketId)
            .emit("fl-user-status", {
              phoneNo: client.handshake.query.userNo,
              statusOnline: true,
            });
        }
      });
    }
  }

  handleNewRoom(socketId): void {
    // console.log(orderId,this.activeChats)
    // this.server
    //   .to(this.activeChats[orderId].socketId)
    //   .emit('chat-room-id', roomId);
  }
  @SubscribeMessage("sign-in")
  signIn(client:Socket, payload):void{
    if(!this.onlineUsers[payload.phoneNo]){
    this.onlineUsers[payload.phoneNo] = { phoneNo: payload.phoneNo, socketId: client.id };
    }
  }
  @SubscribeMessage("logout")
  logout(client: Socket, payload): void {
    delete this.onlineUsers[client.handshake.query.userNo];
  }
  @SubscribeMessage("new-chat-room")
  setActiveChat(client: Socket, payload): void {
    console.log(payload);
    this.activeChats[payload.orderId] = { ...payload, socketId: client.id };
    console.log(this.activeChats);
  }
  @SubscribeMessage("send-message")
  async handleSendMessage(client: Socket, payload) {
    try {
      // console.log("PAYLOAD", payload);

      // check that chatroom has been created in the DB
      const chatroom = await this.chatroomModel.findOne({
        _id: payload.chatroomId,
      });
      // console.log(chatroom)
      if (chatroom.isActive) {
        // console.log("PAYLOA1D", payload);
        let newMessage = new this.messageModel(payload);
        // console.log("==========>1", newMessage);
        let message = await this.messageModel.create(newMessage);
        // console.log("===============>2", message);
        message = await message
          .populate([
            {
              path: "receiverId",
              select: "phoneNo fcmRegistrationToken",
            },
            {
              path: "senderId",
              select: "username",
            },
          ])
          .execPopulate();
        // console.log(message);
        if (this.onlineUsers[message.receiverId.phoneNo]) {
          this.server
            .to(this.onlineUsers[message.receiverId.phoneNo].socketId)
            .emit("recieve-message", message);
        } else {
          await admin
            .messaging()
            .sendToDevice(message.receiverId.fcmRegistrationToken, {
              notification: {
                title: `${message.senderId.username}`,
                body: message.message ? message.message : "Send You Image",
              },data:{
                type:"recieve-message",
                message:JSON.stringify(message)
              }
            },{priority:"high"});
        }
      }
    } catch (err) {
      return err;
    }
  }
  @SubscribeMessage("chat-to-server")
  async handleMessage(
    client: Socket,
    payload: {
      senderId: string;
      receiverId: string;
      chatroomId: string;
      message: string;
      orderId: string;
      isFoodCreatorMessage: boolean;
    }
  ) {
    try {
      // check that chatroom has been created in the DB
      const chatroom = this.chatroomModel.findOne({
        _id: payload.chatroomId,
      });
      if (chatroom) {
        // check that chatroom is currently active
        const roomIsActive = this.activeChats[payload.orderId];
        if (roomIsActive) {
          const newMessage = new this.messageModel(payload);
          const message = await this.messageModel.create(newMessage);
          this.server.to(client.id).emit("chat-to-client", message);

          return message;
        } else {
          this.server.to(client.id).emit("error-sending-chat", {
            message: CHAT_MESSAGES.CHATROOM_NOT_ACTIVE,
            orderId: payload.orderId,
          });
        }
      }
    } catch (error) {
      this.logger.error(error.message);
      if (
        error.message.includes(
          "Message validation failed: chatroomId: Cast to ObjectId failed"
        )
      ) {
        console.log("Chat room does not esist");
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

  @SubscribeMessage("join-room")
  handleJoinRoom(client: Socket, orderId: string) {
    const chatroomId = this.activeChats[orderId].chatroomId;

    client.join(chatroomId);
    client.emit("joined-room", chatroomId);
  }

  @SubscribeMessage("end-chat")
  handleEndChat(
    client: Socket,
    payload: { orderId: string; chatroomId: string }
  ) {
    const {
      [payload.orderId]: endedChat,
      ...updatedActiveChats
    } = this.activeChats;

    this.activeChats = updatedActiveChats;
    client.emit("chat-ended", {
      orderId: endedChat.orderId,
      chatroomId: payload.chatroomId,
    });
  }
}
