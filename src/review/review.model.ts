import * as mongoose from "mongoose";

export const ReviewSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItems" },
  foodLoverId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodLover" },
  foodCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Orders" },
  review:{type:String},
  rating:{type:Number},
  isShareAblePost:{type:Boolean.length,default:true},
  timestamp: { type: String, default: Date.now() },
});
export interface Review extends mongoose.Document {
    menuItemId:any;
    foodCreatorId:any;
    foodLoverId:any;
    orderId:any;
    rating: number;
    review: string;
    timestamp:string;
    isShareAblePost:boolean
  }
