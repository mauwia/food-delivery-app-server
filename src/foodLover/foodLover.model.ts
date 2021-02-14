import * as mongoose from "mongoose";
import { Wallet } from "src/wallet/wallet.model";

export const FoodLoverSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  pinHash: { type: String, default: null },
  countryCode: { type: String },
  countryName: { type: String },
  location: { type: Array },
  email: { type: String, unique:true,sparse:true },
  imageUrl: { type: String, default: null },
  username: { type: String, unique:true,sparse:true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  verified: { type: Boolean, default: false },
  mobileRegisteredId: { type: String, required: true },
  fcmRegistrationToken: { type: Array },
  subscribedTo: { type: Array, default: [] },
});

export interface FoodLover extends mongoose.Document {
  firstName: string;
  lastName: string;
  phoneNo: string;
  passHash: string;
  totalOrders:number;
  verified: boolean;
  pinHash: string | boolean;
  countryCode: string;
  countryName: string;
  email: string;
  location: [];
  imageUrl: string;
  username: string;
  walletId: { [key: string]: any };
  mobileRegisteredId: string;
  fcmRegistrationToken: Array<any>;
  subscribedTo: []
}
