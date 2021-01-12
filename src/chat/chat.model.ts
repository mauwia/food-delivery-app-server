import * as mongoose from "mongoose";

export const ChatroomSchema = new mongoose.Schema({
  foodCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" },
  foodLoverId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodLover" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  timeStamp: { type: String, default: Date.now() },
});

export interface Chatroom extends mongoose.Document {
  foodCreatorId: string;
  foodLoverId: string;
  orderId: string;
  timeStamp: string;
}

export const MessageSchema = new mongoose.Schema({
  chatroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" },
  message: { type: String },
  attachmentUrl: { type: String },
  isFoodCreatorMessage: { type: Boolean, required: true },
});

export interface Message extends mongoose.Document {
  chatroomId: string;
  senderId: string;
  receiverId: string;
  message: string;
  attachmentUrl: string;
  isFoodCreatorMessage: boolean;
}
