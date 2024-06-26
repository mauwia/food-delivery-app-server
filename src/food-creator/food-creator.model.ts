import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

export const FoodCreatorSchema = new mongoose.Schema(
  {
    phoneNo: { type: String, required: true, unique: true },
    passHash: { type: String, required: true },
    pinHash: { type: String },
    email: { type: String },
    username: { type: String },
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
    recipientCode: { type: String },
    // location: { type: Array },
    totalNoshedOrders: { type: Number, default: 0 },
    creatorFoodType: { type: Array },
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dk8xi5rcy/image/upload/v1614929907/Creator/default-avatar-profile-icon-vector-social-media-user-portrait-176256935_isnmem.jpg",
    },
    creatorUrls: { type: Array },
    addressComponents: { type: Array },
    description: { type: String },
    countryCode: { type: String },
    countryName: { type: String },
    businessName: { type: String },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
    creatorThumbnail: { type: String },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodLover" }],
    onlineStatus: { type: Boolean, default: true },
    totalOrders: { type: String, default: "00000" },
    verified: { type: Boolean, default: false },
    avgRating: { type: Number },
    menuExist: { type: Boolean, default: false },
    mobileRegisteredId: { type: String, required: true },
    fcmRegistrationToken: { type: Array },
    unseenNotification: { type: Number, default: 0 },
    whitelistedTester: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    adminVerified: {
      type: String,
      default: "Pending",
      enum: [
        "Pending",
        "Ongoing",
        "Suspended",
        "Completed",
        "Verified", // required for onsite verification stage
      ],
    },
    adminVerificationStage: {
      type: String,
      enum: [
        "KYC Request",
        "KYC Submitted",
        "KYC Verification",
        "Interview Scheduled",
        "Interview Completed",
        "Profile Assessment",
        "Assessment Completed",
        "Account Activated",
      ],
    },
    adminVerificationStart: {
      type: Date,
    },
    adminVerificationComplete: {
      type: Date,
    },
  },
  { timestamps: true }
);
FoodCreatorSchema.index({ location: "2dsphere" });
FoodCreatorSchema.plugin(mongoosePaginate);

export interface FoodCreator extends mongoose.Document {
  // location: Location[];
  emailVerified: boolean;
  unseenNotification: number;
  recipientCode: string;
  addressComponents: any;
  totalNoshedOrders: number;
  creatorUrls: any;
  description: string;
  creatorThumbnail: string;
  username: string;
  creatorFoodType: any;
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
  whitelistedTester: boolean;
  totalOrders: string;
  fcmRegistrationToken: Array<any>;
}
