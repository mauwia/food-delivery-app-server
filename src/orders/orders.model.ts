import * as mongoose from "mongoose";
const orderFood = new mongoose.Schema({
  menuItemName: { type: String },
  description: { type: String },
  preparationTime: { type: String },
  price: { type: Number },
  discount: { type: String },
  itemId: { type: String },
  quantity: { type: Number },
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
      "Complete",
    ],
    required: true,
  },
  orderId: { type: String },
  locationTo: { address: { type: String } },
  locationFrom: { address: { type: String } },
  orderBill: { type: Number },
  approxGivenTime: { type: String, default: Date.now() },
  timeTaken: { type: String, default: Date.now() },
  promoCode: { type: String },
  deliveryCharges: { type: Number },
  timestamp: { type: String, default: Date.now() },
  // chatRoom
  orderedFood: [orderFood],
});

export interface Orders extends mongoose.Document {
  foodCreatorId: any;
  foodLoverId: any;
  orderStatus: string;
  timestamp: string;
  locationTo: any;
  orderId: string;
  locationFrom: any;
  orderBill: number;
  promoCode: string;
  deliveryCharges: number;
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
}
