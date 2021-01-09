import { boolean } from "is_js";
import * as mongoose from "mongoose";

export const FoodCreatorSchema = new mongoose.Schema({
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  pinHash:{type:String},
  location: { type: Array },
  imageUrl: { type: String, default: null },
  countryCode:{type:String},
  countryName:{type:String},
  businessName: { type: String, default: null },
  walletId:{type:mongoose.Schema.Types.ObjectId,ref:"Wallet"},
  subscribers: { type: Array },
  onlineStatus:{type:Boolean,default:true},
  totalOrders:{type:String,default:'000'},
  verified:{type:Boolean,default:false},
  avgRating:{type:Number},
  mobileRegisteredId: { type: String, required: true },
});

export interface FoodCreator extends mongoose.Document {
  phoneNo: string;
  passHash: string;
  location: Array<string>;
  imageUrl: string;
  businessName: string;
  countryCode:{type:String},
  countryName:{type:String},
  walletId:string;
  verified:boolean;
  pinHash:boolean;
  subscribers:[];
  onlineStatus:boolean;
  avgRating:Number;
  mobileRegisteredId: string;
  totalOrders:string
}