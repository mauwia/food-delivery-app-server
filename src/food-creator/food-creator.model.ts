import * as mongoose from "mongoose";

export const FoodCreatorSchema = new mongoose.Schema({
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  pinHash:{type:String, default: null},
  location: { type: Array },
  imageUrl: { type: String, default: null },
  businessName: { type: String, default: null },
  walletId:{type:mongoose.Schema.Types.ObjectId,ref:"Wallet"},
  subscribers: { type: Array },
  onlineStatus:{type:Boolean,default:true},
  verified:{type:Boolean,default:false},
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
  verified:boolean;
  subscribers:[];
  onlineStatus:boolean;
  avgRating:Number;
  mobileRegisteredId: string;
}