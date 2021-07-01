import * as mongoose from "mongoose";

export const NotificationSchema = new mongoose.Schema({
  notificationType: {
    type: String,
    enum: [
      "Subscription",
      "Order",
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
  foodLoverId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodLover" },
  foodCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Orders" },
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transactions" },
  createdAt: { type: String, default: Date.now() },
  updatedAt: { type: String, default: Date.now() },
});
export interface Notification extends mongoose.Document {
  notificationType: string;
  menuItemId: string;
  foodLoverId: string
  foodCreatorId: string
  orderId: string 
  chatRoomId: string
  transactionId: string
  createdAt: string
  updatedAt: string
}
