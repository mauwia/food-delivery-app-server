import { Injectable,HttpException,HttpStatus } from "@nestjs/common";
// import{ BncClient, rpc } from "@binance-chain/javascript-sdk";
import { Wallet } from "./wallet.model";
import {Auth } from '../auth/auth.model'
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { WALLET_MESSAGES } from "./constants/key-constants";
const bcrypt = require("bcryptjs");
const { BncClient, rpc } = require("@binance-chain/javascript-sdk");
const rpcclient = new rpc("http://data-seed-pre-2-s1.binance.org:80");
const client = new BncClient(rpcclient);
client.chooseNetwork("testnet");
@Injectable()
export class WalletService {
  constructor(@InjectModel('Wallet') private readonly walletModel:Model<Wallet>,@InjectModel('Auth') private readonly authModel:Model<Auth> ){}
  async createWallet() {
    // const client = new BncClient("https://bsc-dataseed.binance.org/");
    try {
      const createAccount = await client.createAccount();
      let encryptedPrivateKey= bcrypt.hashSync(createAccount.privateKey, 8);
      let newWallet =new this.walletModel({
        encryptedPrivateKey,
        publicKey:createAccount.address
      })
      let wallet=await this.walletModel.create(newWallet)
      return {createAccount,wallet_id:wallet._id};
    } catch (e) {
      return e;
    }
  }
  async getBalance(publicAddress) {
    try {
      let balance = await rpcclient.getBalance(
        // "tbnb1fdl8ra8dq69s3wnafl954fcxssxkj994kl68lu",
        // "tbnb1m77y2ckxth0v08n9nrkqj292cp03h980ek69e7",
        publicAddress,
        "BNB"
      );
      console.log("a===>", balance);
      return balance;
    } catch (e) {
      if (e.message == "Cannot read property 'address' of null")
        return { balance: 0 };
      return e;
    }
  }
  async sendNoshies(req){
    try{

    }catch(e){
      return e
    }
  }
  async getNoshifyContacts(req){
    try{
      let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw WALLET_MESSAGES.USER_NOT_FOUND;
      }
      const numb = ['2222222','3164538236','3343058884','3164538238',"8289"]
      // console.log(numb)
      const common = [];
      for (let i = 0; i < numb.length; i++) {
        const user = await this.authModel.findOne({
          $or: [
            { phoneNo: numb[i] },
          ],
        }).select("-passHash -pinHash");
        if (user) {
          common.push(user);
        }
      }
      return {contacts:common}
    }catch(error){
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
    
  }
  async addNoshiesByCard(req){
    try{
      
    }catch(error){
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
}

// (async () => {
//   let a: any
//   const b = await client.createAccount();
//  try{  a = await rpcclient.getBalance(
//     // "tbnb1fdl8ra8dq69s3wnafl954fcxssxkj994kl68lu",
//     // "tbnb1m77y2ckxth0v08n9nrkqj292cp03h980ek69e7",
//     b.address,
//     "BNB"
//   );
//   console.log("a===>",a);
// }catch(e){
//       if(e.message=="Cannot read property 'address' of null")
//       console.log("Wallet empty")
//   }
//   console.log('b===>',b);
// })();
// // Transfer Tokens
// client.transfer(fromAddress, toAddress, amount, asset, memo, sequence);
// // Orders
// client.placeOrder(address, symbol, side, price, quantity, sequence);
// client.cancelOrder(fromAddress, symbols, orderIds, refids, sequence);
// // Get Account
// client.getAccount(address);
