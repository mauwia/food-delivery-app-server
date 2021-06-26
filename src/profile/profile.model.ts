import * as mongoose from "mongoose";

export const TestersSchema = new mongoose.Schema({
    phoneNo:{type:String,unique:true}
  });
export interface Testers extends mongoose.Document {
    phoneNo:string
  }