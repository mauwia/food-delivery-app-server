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
    enum: ["Send", "Request", "Withdraw", "By_Card", "By_Bank"],
    required: true,
  },
  from: { type: String },
  to: { type: String },
  amount: { type: Number },
  currency: { type: String },
  timeStamp: { type: String, default: Date.now() },
  message: { type: String },
  transactionHash: { type: String },
  tokenAmountInUsd: { type: Number },
  gasFeeInUsd: { type: Number },
//   walletId:{type:mongoose.Schema.Types.ObjectId,ref:"Wallet", required: true},
});
export const WalletSchema = new mongoose.Schema({
  walletAddress: { type: String },
  publicKey: { type: String },
  encryptedPrivateKey: { type: String },
  assets: [TokenSchema],
});
export interface Wallet {
  walletAddress: string;
  publicKey: string;
  encryptedPrivateKey: string;
  assets: [];
}
export interface Transactions {
  transactionType: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  timeStamp: string;
  message: string;
  transactionHash: string;
  tokenAmountInUsd: number;
  gasFeeInUsd: number;
//   walletId:string
}
