import * as mongoose from "mongoose";

export const MenuSchema = new mongoose.Schema({
  foodCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" },
  menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItems" }],
  menuName: { type: String },
});
export const MenuItemSchema = new mongoose.Schema({
  imageUrls: [{ type: String }],
  itemName: { type: String },
  description: { type: String },
  preparationTime: { type: String },
  price: { type: Number },
  discount: {
    type: Number,
  },
  reviews: [{ type: Object }],
  rating: { type: Number },
  orderCounts: { type: Number, default: 0 },
});
export interface Menu extends mongoose.Document {
  foodCreatorId: string;
  menuName: string;
  menuItems: Array<String>;
}
export interface MenuItems extends mongoose.Document {
  imageUrls: Array<string>;
  itemName: string;
  description: string;
  preparationTime: string;
  price: number;
  rating: number;
  discount: number;
  reviews: Array<object>;
  orderCounts: number;
}
