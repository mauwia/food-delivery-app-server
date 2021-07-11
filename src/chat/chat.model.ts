import * as mongoose from "mongoose";

export const ChatroomSchema = new mongoose.Schema({
  foodCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" },
  foodLoverId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodLover" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Orders" },
  timeStamp: { type: String, default: Date.now() },
  isActive: { type: Boolean, default: true },
});

export interface Chatroom extends mongoose.Document {
  foodCreatorId: string;
  foodLoverId: string;
  orderId: string;
  timeStamp: string;
  isActive: boolean;
}

export const MessageSchema = new mongoose.Schema({
  chatroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" },
  senderId: { type: mongoose.Schema.Types.ObjectId, refPath: "onSenderModel" },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onReceiverModel",
  },
  onSenderModel: {
    type: String,
    required: true,
    enum: ["FoodLover", "FoodCreator"],
  },
  onReceiverModel: {
    type: String,
    required: true,
    enum: ["FoodLover", "FoodCreator"],
  },
  message: { type: String },
  attachmentUrl: { type: String },
  recordedMessage: { url: { type: String }, duration: { type: String } },
  // isFoodCreatorMessage: { type: Boolean, required: true },
  timeStamp: { type: String, default: Date.now() },
});

export interface Message extends mongoose.Document {
  timestamp: string;
  onSenderModel: any;
  onReceiverModel: any;
  chatroomId: string;
  senderId: any;
  receiverId: any;
  message: string;
  attachmentUrl: string;
  recordedMessage: any;
  // isFoodCreatorMessage: boolean;
}
