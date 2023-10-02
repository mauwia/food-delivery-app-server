import * as mongoose from "mongoose";

export const NotificationSchema = new mongoose.Schema({
  notificationType: {
    type: String,
    enum: [
      "Subscribe",
      "Unsubscribe",
      "Order",
      "Bought Noshies",
      "Request Noshies",
      "Request Success Noshies",
      "Request Fail Noshies",
      "Menu Added",
      "Menu Item Added",
      "Delete Menu",
      "Rating",
      "Withdraw Success",
      "Payment Received Success",
      "Chat",
      "Send Noshies",
      "Receive Noshies",
    ],
    required: true,
  },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItems" },
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
    default: "FoodLover",
    enum: ["FoodLover", "FoodCreator"],
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Orders" },
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transactions" },
  orderStatus: { type: String },
  createdAt: { type: String, default: Date.now() },
  updatedAt: { type: String, default: Date.now() },
  messageId:{type: mongoose.Schema.Types.ObjectId, ref: "Message"}
});
export interface Notification extends mongoose.Document {
  notificationType: string;
  orderStatus: string;
  menuItemId: any;
  orderId: any;
  chatRoomId: any;
  transactionId: any;
  createdAt: string;
  updatedAt: string;
  senderId: any;
  receiverId: any;
  onSenderModel: string;
  onReceiverModel: string;
  messageId:any
}
