import * as mongoose from "mongoose";

const TokenSchema=new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    tokenAddress:{type:String},
    tokenSymbol:{type:String},
    tokenName:{type:String},
    amount:{type:Number,default:0},
})
export const WalletSchema=new mongoose.Schema({
    walletAddress:{type:String},
    publicKey:{type:String},
    encryptedPrivateKey:{type:String},
    assets:[TokenSchema]
})
export interface Wallet{
    walletAddress:string;
    publicKey:string;
    encryptedPrivateKey:string;
    assets:[]
}