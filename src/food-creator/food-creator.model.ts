import * as mongoose from "mongoose";

export const LocationSchema = new mongoose.Schema({
  foodCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCreator" },
  address: { type: String },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});
LocationSchema.index({ location: "2dsphere" });
export const FoodCreatorSchema = new mongoose.Schema({
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  pinHash: { type: String },
  // location: [LocationSchema],
  // location: ,
  imageUrl: { type: String, default: null },
  countryCode: { type: String },
  countryName: { type: String },
  businessName: { type: String, default: null },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  subscribers: { type: Array },
  onlineStatus: { type: Boolean, default: true },
  totalOrders: { type: String, default: "000" },
  verified: { type: Boolean, default: false },
  avgRating: { type: Number },
  mobileRegisteredId: { type: String, required: true },
});
export interface FoodCreator extends mongoose.Document {
  phoneNo: string;
  passHash: string;
  // location: Array<any>;
  imageUrl: string;
  businessName: string;
  countryCode: { type: String };
  countryName: { type: String };
  walletId: string;
  verified: boolean;
  pinHash: boolean;
  subscribers: [];
  onlineStatus: boolean;
  avgRating: Number;
  mobileRegisteredId: string;
  totalOrders: string;
}
export interface Location extends mongoose.Document {
  foodCreatorId: string;
  address: string;
  location: any;
}
