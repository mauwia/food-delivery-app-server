import * as mongoose from "mongoose";

export const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: {type: String, required: true },
  role: { type: String }
}, { timestamps: true });

export interface AdminUser extends mongoose.Document {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}
