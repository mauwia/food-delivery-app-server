import * as mongoose from "mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';

export const AdminNotificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId },
  subjectName: { type: String, required: true },
  subjectImgUrl: {type: String, required: true },
  viewed: { type: Boolean, default: false }
}, { timestamps: true });
AdminNotificationSchema.plugin(mongoosePaginate);

export interface AdminNotification extends mongoose.Document {
  type: string;
  subjectId: mongoose.ObjectId;
  subjectName: string;
  subjectImgUrl: string;
  viewed: boolean;
}
