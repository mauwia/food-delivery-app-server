import * as mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  tokenAddress: { type: String },
  tokenSymbol: { type: String },
  tokenName: { type: String },
  amount: { type: Number, default: 0 },
});
export const TransactionsSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: ["Sent Noshies", "Noshies Request", "Withdrawal to Bank", "Bought Noshies By Card", "Bought Noshies By Bank","Bought Noshies By Crypto"],
    required: true,
  },
  from: { type: String },
  to: { type: String },
  amount: { type: Number },
  currency: { type: String },
  status:{type:String},
  timeStamp: { type: String, default: Date.now() },
  message: { type: String },
  transactionHash: { type: String },
  tokenAmountInUsd: { type: Number },
  gasFeeInUsd: { type: Number },
  memo:{type:String}
//   walletId:{type:mongoose.Schema.Types.ObjectId,ref:"Wallet", required: true},
});
export const WalletSchema = new mongoose.Schema({
  walletAddress: { type: String },
  publicKey: { type: String },
  encryptedPrivateKey: { type: String },
  assets: [TokenSchema],
  requestReceivedForNoshies:{type:Array}
});
export interface Wallet extends mongoose.Document {
  walletAddress: string;
  publicKey: string;
  encryptedPrivateKey: string;
  assets: Array<Token>;
  requestReceivedForNoshies:Array<any>;
}
export interface Transactions  extends mongoose.Document {
  transactionType: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  timeStamp: string;
  message: string;
  status:string;
  transactionHash: string;
  tokenAmountInUsd: number;
  gasFeeInUsd: number;
  memo:string;
//   walletId:string
}
export interface Token extends mongoose.Document{

  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  amount: number;
}