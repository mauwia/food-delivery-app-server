import * as mongoose from "mongoose";

export const FoodCreatorSchema = new mongoose.Schema({
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  pinHash: { type: String },
  email: { type: String, unique: true, sparse: true },
  username: { type: String, unique: true, sparse: true },
  location: {
    address: { type: String },
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
      // required: true,
    },
  },

  // location: { type: Array },
  totalNoshedOrders:{type:Number,default:0},
  creatorFoodType: { type: Array },
  imageUrl: { type: String, default: "https://res.cloudinary.com/dk8xi5rcy/image/upload/v1614929907/Creator/default-avatar-profile-icon-vector-social-media-user-portrait-176256935_isnmem.jpg" },
  countryCode: { type: String },
  countryName: { type: String },
  businessName: { type: String, default: null },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  creatorThumbnail:{type:String},
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodLover" }],
  onlineStatus: { type: Boolean, default: true },
  totalOrders: { type: String, default: "00000" },
  verified: { type: Boolean, default: false },
  avgRating: { type: Number },
  menuExist: { type: Boolean,default:false },
  mobileRegisteredId: { type: String, required: true },
  fcmRegistrationToken: { type: Array },
});
FoodCreatorSchema.index({ location: "2dsphere" });
export interface FoodCreator extends mongoose.Document {
  // location: Location[];
  totalNoshedOrders:number;
  creatorThumbnail:string;
  username: string;
  creatorFoodType: string;
  phoneNo: string;
  passHash: string;
  location: any;
  imageUrl: string;
  email: string;
  menuExist: boolean;
  businessName: string;
  countryCode: { type: String };
  countryName: { type: String };
  walletId: string;
  verified: boolean;
  pinHash: boolean;
  subscribers: any;
  onlineStatus: boolean;
  avgRating: Number;
  mobileRegisteredId: string;
  totalOrders: string;
  fcmRegistrationToken: Array<any>;
}
