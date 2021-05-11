import * as mongoose from "mongoose";

export const ReviewSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItems" },
  foodLoverId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodLover" },
  foodCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Orders" },
  review:{type:String},
  rating:{type:Number}
});
export interface Review extends mongoose.Document {
    menuItemId:any;
    foodCreatorId:any;
    foodLoverId:any;
    orderId:any;
    rating: number;
    review: string;
  }
