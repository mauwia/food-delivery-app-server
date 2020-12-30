import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
// import{ BncClient, rpc } from "@binance-chain/javascript-sdk";
import { Wallet, Transactions } from "./wallet.model";
import { FoodLover } from "../foodLover/foodLover.model";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { WALLET_MESSAGES } from "./constants/key-constants";
const bcrypt = require("bcryptjs");
const { BncClient, rpc, crypto } = require('@binance-chain/javascript-sdk');
const axios = require('axios');
​
const api = "https://testnet-dex.binance.org/";
const bnbClient = new BncClient(api);
const httpClient = axios.create({ baseURL: api });
​
bnbClient.chooseNetwork("testnet");
bnbClient.initChain();

@Injectable()
export class WalletService {
  constructor(
    @InjectModel("Wallet") private readonly walletModel: Model<Wallet>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("Transactions")
    private readonly transactionsModel: Model<Transactions>
  ) {}
  private logger=new Logger("Wallet")
  async createWallet() {
    // const client = new BncClient("https://bsc-dataseed.binance.org/");
    try {
      const createAccount = await bnbClient.createAccount();
      let encryptedPrivateKey = bcrypt.hashSync(createAccount.privateKey, 8);
      let newWallet = new this.walletModel({
        encryptedPrivateKey,
        publicKey: createAccount.address,
      });
      let wallet = await this.walletModel.create(newWallet);
      return { createAccount, wallet_id: wallet._id };
    } catch (error) {
      this.logger.error(error,error.stack)
      return error;
    }
  }
  async getBalance(publicAddress) {
    try {
      let balance = await bnbClient.getBalance(
        // "tbnb1fdl8ra8dq69s3wnafl954fcxssxkj994kl68lu",
        // "tbnb1m77y2ckxth0v08n9nrkqj292cp03h980ek69e7",
        publicAddress,
        "BNB"
      );
      return balance;
    } catch (e) {
        return e;
    }
  }
  async withdrawNoshies(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw WALLET_MESSAGES.USER_NOT_FOUND;
      }
      let { publicKey, tokenName, amount } = req.body;
      // console.log(publicKey);
      let wallet = await this.walletModel.findOne({
        publicKey: publicKey,
      });
      if (!wallet) {
        throw WALLET_MESSAGES.PUBLIC_KEY_NOT_FOUND;
      }
      let asset = wallet.assets.find((asset) => asset.tokenName == tokenName);
      asset.amount = asset.amount - amount;
      await wallet.save();
      await this.createTransaction({
        transactionType: "Withdraw",
        from: publicKey,
        amount,
        currency: tokenName,
        message: "Test message",
      });
      return { messages:WALLET_MESSAGES.WITHDRAW_SUCCESS , wallet };
    } catch (error) {
      this.logger.error(error,error.stack)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async sendNoshies(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw WALLET_MESSAGES.USER_NOT_FOUND;
      }
      let { senderPublicKey, recieverPublicKey, amount, tokenName } = req.body;
      let senderWallet = await this.walletModel.findOne({
        publicKey: senderPublicKey,
      });
      let recieverWallet = await this.walletModel.findOne({
        publicKey: recieverPublicKey,
      });
      if (!senderWallet || !recieverWallet) {
        throw WALLET_MESSAGES.PUBLIC_KEY_NOT_FOUND;
      }
      let senderAssets = senderWallet.assets.find(
        (asset) => asset.tokenName == tokenName
      );
      let recieverAssets = recieverWallet.assets.find(
        (asset) => asset.tokenName == tokenName
      );
      if (!recieverAssets) {
        let newRecieverAsset = await this.createAsset(
          tokenName,
          recieverWallet,
          amount
        );
        // this.transferTokens(recieverPublicKey,amount,"BNB","test Message")
        senderAssets.amount = senderAssets.amount - amount;
        await senderWallet.save();
        await this.createTransaction({
          transactionType: "Send",
          from: senderPublicKey,
          to: recieverPublicKey,
          amount: amount,
          currency: tokenName,
          message: "Test Message",
        });
        return {
          message: WALLET_MESSAGES.TRANSACTION_SUCCESS,
          // senderAmount: senderAssets.amount,
          // recieverAmount: newRecieverAsset.amount,
          senderWallet
        };
      } else {
        this.transferTokens(recieverPublicKey,amount,"BNB","test Message")
        recieverAssets.amount = recieverAssets.amount + +amount;
        senderAssets.amount = senderAssets.amount - amount;
        await recieverWallet.save();
        await senderWallet.save();
        await this.createTransaction({
          transactionType: "Send",
          from: senderPublicKey,
          to: recieverPublicKey,
          amount: amount,
          currency: tokenName,
          message: "Test Message",
        });
        return {
          message: WALLET_MESSAGES.TRANSACTION_SUCCESS,
          // senderAmount: senderAssets.amount,
          // recieverAmount: recieverAssets.amount,
          senderWallet
        };
      }
    } catch (error) {
      this.logger.error(error,error.stack)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async getNoshifyContacts(req) {
    try {
      let { user } = req;
      let { contacts } = req.body;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw WALLET_MESSAGES.USER_NOT_FOUND;
      }
      // const numb = [
      //   "2222222",
      //   "3164538236",
      //   "3343058884",
      //   "3164538238",
      //   "8289","03343021289"
      // ];
      // console.log(numb)
      const common = [];
      for (let i = 0; i < contacts.length; i++) {
        const user = await this.foodLoverModel
          .findOne({
            $or: [{ phoneNo: contacts[i] }],
          })
          .select("-passHash -pinHash")
          .populate("walletId", "publicKey");
        if (user) {
          common.push(user);
        }
      }
      return { contacts: common };
    } catch (error) {
      this.logger.error(error,error.stack)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async addNoshiesByCard(req, source) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw WALLET_MESSAGES.USER_NOT_FOUND;
      }
      let { publicKey, amount, tokenName } = req.body;
      let wallet = await this.walletModel.findOne({
        publicKey: publicKey,
      });
      if (!wallet) {
        throw WALLET_MESSAGES.PUBLIC_KEY_NOT_FOUND;
      }
      if (wallet.assets) {
        // let asset=wallet.assets.find(asset=>asset.tokenName=='here1')
        let asset = wallet.assets.find((asset) => asset.tokenName == tokenName);
        if (!asset) {
          let token = await this.createAsset(tokenName, wallet, amount);
          await this.createTransaction({
            transactionType: source,
            from: publicKey,
            amount,
            currency: tokenName,
            message: "Test message",
          });
          return {
            message:WALLET_MESSAGES.AMOUNT_ADDED_SUCCESS ,
            totalAmount: token.amount,
          };
        }
        asset.amount = asset.amount + amount;
        wallet.save();
        await this.createTransaction({
          transactionType: source,
          from: publicKey,
          amount,
          currency: tokenName,
          message: "Test message",
        });
        return {
          message: WALLET_MESSAGES.AMOUNT_ADDED_SUCCESS,
          totalAmount: asset.amount,
        };
      } else {
        let token = await this.createAsset(tokenName, wallet, amount);
        await this.createTransaction({
          transactionType: source,
          from: publicKey,
          amount,
          currency: tokenName,
          message: "Test message",
        });
        return {
          message: WALLET_MESSAGES.AMOUNT_ADDED_SUCCESS,
          totalAmount: token.amount,
        };
      }
    } catch (error) {
      this.logger.error(error,error.stack)
      console.log(error)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async getAllAssets(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId");
      if (!UserInfo) {
        throw WALLET_MESSAGES.USER_NOT_FOUND;
      }
      // console.log(UserInfo)
      return { assets: UserInfo.walletId.assets };
    } catch (error) {
      this.logger.error(error,error.stack)
      // console.log(error)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async getTransactions(req) {
    try {
      // console.log(req.params)
      let { user } = req;
      const UserInfo = await this.foodLoverModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId", "publicKey");
      if (!UserInfo) {
        throw WALLET_MESSAGES.USER_NOT_FOUND;
      }
      let {walletId}=UserInfo
      let {publicKey}=walletId
      let transactions  = await this.transactionsModel.find({
        $or: [
          { to: publicKey },
          { from:publicKey },
        ],
      });
      if (req.params.assetId) {
        let { assetId } = req.params;
        transactions = transactions.filter(
          (transaction) => transaction.currency == assetId
        );
        return { transactions };
      }
      return { transactions };
    } catch (error) {
      this.logger.error(error,error.stack)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  async createAsset(tokenName, wallet, amount) {
    try {
      let token = {
        tokenAddress: "0x1w0iew9e39r3",
        tokenSymbol: tokenName,
        tokenName,
        amount: parseInt(amount),
      };
      wallet.assets.push(token);
      await wallet.save();
      return token;
    } catch (error) {
      this.logger.error(error,error.stack)
      return error;
    }
  }
  async createTransaction(transactionDetails) {
    let newTransaction = new this.transactionsModel(transactionDetails);
    let transaction = await this.transactionsModel.create(newTransaction);
    return transaction;
  }
  async transferTokens(addressTo,amount,asset,message){
    let privKey = "424e682aafe805cb1e8816c658ab73110e722931f4413f3043a13b879c4c4b77";
  
    bnbClient.setPrivateKey(privKey);
    console.log("here")
    let addressFrom = crypto.getAddressFromPrivateKey(privKey);
    console.log(addressFrom)
    const sequenceURL = `${api}api/v1/account/${addressFrom}/sequence`;
    
    httpClient
      .get(sequenceURL)
      .then((res) => {
        const sequence = res.data.sequence || 0
        return bnbClient.transfer(
          addressFrom,
          addressTo,
          amount,
          asset,
          message,
          sequence
        )
      })
      .then((result) => {
        console.log(result)
        if (result.status === 200) {
          console.log("success", result.result[0].hash)
        } else {
          console.error("error", result)
        }
      })
      .catch((error) => {
        console.error("error", error)
      })
  
  }
}


