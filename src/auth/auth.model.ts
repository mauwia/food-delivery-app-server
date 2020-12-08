import * as mongoose from "mongoose";

export const AuthSchema = new mongoose.Schema({
  phoneNo: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  pinHash: { type: String },
  location: { type: Array },
  imageUrl: { type: String },
  username: { type: String },
  verified: { type: Boolean, default: false },
  mobileRegisteredId: { type: String, required: true },
});

export interface Auth {
  phoneNo: string;
  passHash: string;
  verified: boolean;
  location: [];
  imageUrl: string;
  username: string;
  mobileRegisteredId: string;
}
