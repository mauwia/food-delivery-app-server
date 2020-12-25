import * as mongoose from "mongoose";

export const FoodCreatorSchema = new mongoose.Schema({
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  location: { type: Array },
  imageUrl: { type: String, default: null },
  businessName: { type: String, default: null },
  walletId:{type:mongoose.Schema.Types.ObjectId,ref:"Wallet"},
  subscribers: { type: Array },
  onlineStatus:{type:Boolean},
  avgRating:{type:Number},
  mobileRegisteredId: { type: String, required: true },
});

export interface FoodCreator {
  phoneNo: string;
  passHash: string;
  location: [];
  imageUrl: string;
  businessName: string;
  walletId:string;
  subscribers:[];
  onlineStatus:boolean;
  avgRating:Number;
  mobileRegisteredId: string;
}