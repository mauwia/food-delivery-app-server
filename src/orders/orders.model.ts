import * as mongoose from "mongoose";
export const orderFoodSchema = new mongoose.Schema({
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
  review: { type: String },
  rating: { type: Number },
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
  foodCreatorLocation: { type: Object },
  review: { type: String },
  orderId: { type: String },
  tokenName: { type: String },
  locationTo: { type: Object },
  locationFrom: { type: Object },
  timezone: { type: String,default:"+44" },
  orderBill: { type: Number },
  approxGivenTime: { type: String, default: Date.now() },
  timeTaken: { type: String, default: Date.now() },
  promoCode: { type: String },
  rating: { type: Number },
  reason: { type: String },
  deliveryCharges: { type: Number },
  reviewTimestamp: { type: String, default: Date.now() },
  timestamp: { type: String, default: Date.now() },
  NoshDeduct: { type: Number },
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" },
  orderedFood: [orderFoodSchema],
  realOrderBill: { type: Number },
  orderReviewed: { type: Boolean, default: false },
});

export interface Orders extends mongoose.Document {
  realOrderBill: number;
  foodCreatorId: any;
  foodLoverId: any;
  orderStatus: string;
  timezone: string;
  timestamp: string;
  locationTo: any;
  tokenName: string;
  orderId: string;
  locationFrom: any;
  foodCreatorLocation: any;
  NoshDeduct: number;
  orderBill: number;
  chatRoomId: string;
  promoCode: string;
  reviewTimestamp: string;
  deliveryCharges: number;
  rating: number;
  orderedFood: any;
  reason: string;
  review: string;
  orderReviewed: boolean;
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
  rating: number;
  review: string;
}
