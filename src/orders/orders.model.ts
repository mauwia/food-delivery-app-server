import * as mongoose from "mongoose";
const orderFood = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItems" },
  menuItemName: { type: String },
  description: { type: String },
  preparationTime: { type: String },
  price: { type: Number },
  discount: { type: String },
  itemId: { type: String },
  quantity: { type: Number },
  realPrice: { type: Number },
  imageUrls: { type: Array },
});
export const OrdersSchema = new mongoose.Schema({
  foodLoverId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodLover" },
  foodCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" },
  // foodDeliveryId:mongoose.Schema.Types.ObjectId,
  orderStatus: {
    type: String,
    enum: [
      "New",
      "Accepted",
      "Being Prepared",
      "Prepared",
      "InTransit",
      "Decline",
      "Cancel",
      "Order Completed",
    ],
    required: true,
  },
  orderId: { type: String },
  tokenName: { type: String },
  locationTo: { address: { type: String } },
  locationFrom: { address: { type: String } },
  orderBill: { type: Number },
  approxGivenTime: { type: String, default: Date.now() },
  timeTaken: { type: String, default: Date.now() },
  promoCode: { type: String },
  rating:{type:Number},
  deliveryCharges: { type: Number },
  timestamp: { type: String, default: Date.now() },
  NoshDeduct: { type: Number },
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" },
  orderedFood: [orderFood],
  realOrderBill: { type: Number },
});

export interface Orders extends mongoose.Document {
  realOrderBill: number;
  foodCreatorId: any;
  foodLoverId: any;
  orderStatus: string;
  timestamp: string;
  locationTo: any;
  tokenName: string;
  orderId: string;
  locationFrom: any;
  NoshDeduct: number;
  orderBill: number;
  chatRoomId: string;
  promoCode: string;
  deliveryCharges: number;
  rating:number;
  orderedFood: any;
}
export interface orderFood extends mongoose.Document {
  menuItemName: string;
  description: string;
  preparationTime: string;
  price: number;
  discount: string;
  itemId: string;
  quantity: number;
  realPrice: number;
}
