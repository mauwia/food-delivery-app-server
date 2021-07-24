import * as mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  tokenAddress: { type: String },
  tokenSymbol: { type: String },
  tokenName: { type: String },
  amount: { type: Number, default: 0 },
},
{ timestamps: true });
export const TransactionsSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: [
      "Sent Noshies",
      "Noshies Request",
      "Withdrawal to Bank",
      "Bought Noshies By Card",
      "Bought Noshies By Bank",
      "Bought Noshies By Crypto",
      "Payment Received",
      "In Process Order",
    ],
    required: true,
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, refPath: "onSenderModel" },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onReceiverModel",
  },
  onSenderModel: {
    type: String,
    required: true,
    enum: ["FoodLover", "FoodCreator"],
  },
  onReceiverModel: {
    type: String,
    default: "FoodLover",
    enum: ["FoodLover", "FoodCreator"],
  },
  from: { type: String },
  to: { type: String },
  amount: { type: Number },
  deductAmount: { type: Number },
  currency: { type: String },
  status: { type: String },
  timeStamp: { type: String, default: Date.now() },
  message: { type: String },
  transactionHash: { type: String },
  tokenAmountInUsd: { type: Number },
  gasFeeInUsd: { type: Number },
  memo: { type: String },
  reference: { type: String },
  bankName:{type:String},
  orderId: { type: String },
  //   walletId:{type:mongoose.Schema.Types.ObjectId,ref:"Wallet", required: true},
});
export const WalletSchema = new mongoose.Schema({
  dedicatedAccountNumber: { type: String },
  dedicatedAccountName: { type: String },
  dedicatedBankName: { type: String },
  walletAddress: { type: String },
  publicKey: { type: String },
  encryptedPrivateKey: { type: String },
  assets: [TokenSchema],
  escrow: { type: Number, default: 0 },
  requestReceivedForNoshies: { type: Array },
},
{ timestamps: true });
export interface Wallet extends mongoose.Document {
  dedicatedAccountNumber: string;
  dedicatedAccountName: string;
  dedicatedBankName: string;
  walletAddress: string;
  publicKey: string;
  encryptedPrivateKey: string;
  assets: Array<Token>;
  escrow: number;
  requestReceivedForNoshies: Array<any>;
}
export interface Transactions extends mongoose.Document {
  transactionType: string;
  from: string;
  to: string;
  orderId: string;
  senderId: any;
  receiverId: any;
  onSenderModel: string;
  onReceiverModel: string;
  amount: number;
  deductAmount: number;
  currency: string;
  timeStamp: string;
  message: string;
  status: string;
  transactionHash: string;
  bankName:string;
  tokenAmountInUsd: number;
  gasFeeInUsd: number;
  memo: string;
  reference: string;
  //   walletId:string
}
export interface Token extends mongoose.Document {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  amount: number;
}
