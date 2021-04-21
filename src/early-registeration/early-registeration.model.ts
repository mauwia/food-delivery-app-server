import * as mongoose from "mongoose";

export const EarlyRegisterationModel = new mongoose.Schema({
    email: {type:String},
    role:{type:String}
  });

export interface EarlyRegisteration extends mongoose.Document {
    email: string;
    role:string;
  }