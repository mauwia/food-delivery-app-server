import * as mongoose from "mongoose";

export const FoodLoverSchema = new mongoose.Schema({
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  pinHash: { type: String, default: null },
  location: { type: Array },
  imageUrl: { type: String, default: null },
  username: { type: String, default: null },
  walletId:{type:mongoose.Schema.Types.ObjectId,ref:"Wallet"},
  verified: { type: Boolean, default: false },
  mobileRegisteredId: { type: String, required: true },
});

export interface FoodLover {
  phoneNo: string;
  passHash: string;
  verified: boolean;
  location: [];
  imageUrl: string;
  username: string;
  walletId:string
  mobileRegisteredId: string;
}
