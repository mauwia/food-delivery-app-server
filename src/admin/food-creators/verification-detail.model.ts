import * as mongoose from "mongoose";

export const VerificationDetailSchema = new mongoose.Schema({
  fcId: { type: mongoose.Schema.Types.ObjectId },
  legalBusinessName: { type: String },
  businessAddress: { type: String },
  cacNumber: { type: String },
  contactPersonName: { type: String },
  contactPersonEmail: { type: String },
  contactPersonMobile: { type: String },
  contactPersonStateOfOrigin: { type: String },
  contactPersonAddress: { type: String },
  nextOfKinName: { type: String },
  nextOfKinRelationship: { type: String },
  nextOfKinMobile: { type: String },
  nextOfKinAddress: { type: String },
  currentRevenue: { type: String },
  dreamRevenue: { type: String },
  newToFoodCreationBusiness: { type: String },
  beenCookingForSale: { type: String },
  currentAverageMonthlyOrders: { type: Number },
  dreamMonthlyOrders: { type: Number },
  monthlyOrdersICanHandle: { type: Number },
}, { timestamps: true });

export interface VerificationDetail extends mongoose.Document {
  fcId: mongoose.ObjectId;
  legalBusinessName: string;
  businessAddress: string;
  cacNumber: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonMobile: string;
  contactPersonStateOfOrigin: string;
  contactPersonAddress: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinMobile: string;
  nextOfKinAddress: string;
  currentRevenue: string;
  dreamRevenue: string;
  newToFoodCreationBusiness: string;
  beenCookingForSale: string;
  currentAverageMonthlyOrders: number;
  dreamMonthlyOrders: number;
  monthlyOrdersICanHandle: number;
}
