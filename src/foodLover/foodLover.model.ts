import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";
import { Wallet } from "src/wallet/wallet.model";

export const FoodLoverSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  customerCode: { type: String },
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  pinHash: { type: String, default: null },
  countryCode: { type: String },
  countryName: { type: String },
  location: { type: Array },
  addressComponents: { type: Array },
  email: { type: String },
  username: { type: String },
  dedicatedCustomer: { type: Boolean, default: false },
  imageUrl: {
    type: String,
    default:
      "https://res.cloudinary.com/dk8xi5rcy/image/upload/v1614929907/Creator/default-avatar-profile-icon-vector-social-media-user-portrait-176256935_isnmem.jpg",
  },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  verified: { type: Boolean, default: false },
  mobileRegisteredId: { type: String, required: true },
  fcmRegistrationToken: { type: Array },
  subscribedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" }],
  isActive: { type: Boolean, default: true },
  recipientCode: { type: String },
  unseenNotification: { type: Number, default: 0 },
});
FoodLoverSchema.plugin(mongoosePaginate);

export interface FoodLover extends mongoose.Document {
  unseenNotification: number;

  dedicatedCustomer: boolean;
  customerCode: string;
  firstName: string;
  recipientCode: string;
  lastName: string;
  phoneNo: string;
  passHash: string;
  totalOrders: number;
  verified: boolean;
  pinHash: string | boolean;
  countryCode: string;
  countryName: string;
  isActive: boolean;
  email: string;
  addressComponents: any;
  location: [];
  imageUrl: string;
  username: string;
  walletId: { [key: string]: any };
  mobileRegisteredId: string;
  fcmRegistrationToken: Array<any>;
  subscribedTo: any;
}
