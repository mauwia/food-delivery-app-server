import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
// import{ BncClient, rpc } from "@binance-chain/javascript-sdk";
import * as utils from "../utils";
var cron = require("node-cron");
import * as admin from "firebase-admin";
import { Wallet, Transactions } from "./wallet.model";
import { FoodLover } from "../foodLover/foodLover.model";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { WALLET_MESSAGES } from "./constants/key-constants";
import { AppGateway } from "../app.gateway";
import * as moment from 'moment'
import { FoodCreator } from "src/food-creator/food-creator.model";
import axios from "axios";
const fetch = require("node-fetch");
@Injectable()
export class WalletService {
  constructor(
    @InjectModel("Wallet") private readonly walletModel: Model<Wallet>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("Transactions")
    private readonly transactionsModel: Model<Transactions>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    private readonly appGatway: AppGateway
  ) {}
  private logger = new Logger("Wallet");
  async createWallet() {
    // const client = new BncClient("https://bsc-dataseed.binance.org/");
    try {
      // const createAccount = await bnbClient.createAccount();
      let newWallet = new this.walletModel({});
      let wallet = await this.walletModel.create(newWallet);
      return { wallet };
    } catch (error) {
      this.logger.error(error, error.stack);
      return error;
    }
  }

  async getBalance(wallet_id) {
    try {
      let wallet = await this.walletModel.findById(wallet_id);
      if (wallet.assets.length) {
        return wallet.assets[0].amount;
      } else {
        return 0;
      }
      // let balance = await bnbClient.getBalance(
      //   // "tbnb1fdl8ra8dq69s3wnafl954fcxssxkj994kl68lu",
      //   // "tbnb1m77y2ckxth0v08n9nrkqj292cp03h980ek69e7",
      //   publicAddress,
      //   "BNB"
      // );
      // return balance;
    } catch (e) {
      return e;
    }
  }
  async initializeWithdraw(req) {
    try {
      let { user } = req;
      let UserInfo = await this.validation(user);

      // if (!UserInfo) {
      //   throw {
      //     msg: WALLET_MESSAGES.USER_NOT_FOUND,
      //     status: HttpStatus.NOT_FOUND,
      //   };
      // }
      let wallet = await this.walletModel.findById(UserInfo.walletId);
      if (!wallet) {
        throw {
          msg: WALLET_MESSAGES.WALLET_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { tokenName, amount, timeStamp, reference, role } = req.body;
      await this.createTransaction({
        timeStamp,
        transactionType: "Withdrawal to Bank",
        from: UserInfo.phoneNo,
        onSenderModel: role,
        senderId: UserInfo._id,
        amount,
        currency: "NOSH",
        message: "",
        status: "PENDING",
        reference: reference,
      });
      return { messages: WALLET_MESSAGES.WITHDRAW_SUCCESS, wallet };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async withdrawNoshies(req, res) {
    try {
      // console.log("WORKING", req.body);
      let { data, event } = req.body;
      if (event === "transfer.success") {
        let transaction = await this.transactionsModel
          .findOneAndUpdate(
            {
              reference: data.recipient.recipient_code,
            },
            { status: "SUCCESSFUL", reference: "" }
          )
          .populate("senderId", "walletId");
        console.log("Transaction", transaction);
        let wallet = await this.walletModel.findById(
          transaction.senderId.walletId
        );
        if (!wallet) {
          throw {
            msg: WALLET_MESSAGES.WALLET_NOT_FOUND,
            status: HttpStatus.NOT_FOUND,
          };
        }
        let asset = wallet.assets.find(
          (asset) => asset.tokenName == transaction.currency
        );
        asset.amount = asset.amount - transaction.amount;
        await wallet.save();
      } else if (event === "transfer.failed") {
        let transaction = await this.transactionsModel.findOneAndUpdate(
          {
            reference: data.recipient.recipient_code,
          },
          { status: "FAILED" }
        );
      }else if(event==="charge.success"){
        console.log(data)
        let UserInfo=await this.foodLoverModel.findOne({customerCode:data.customer.customer_code})
        if (!UserInfo) {
          throw {
            msg: WALLET_MESSAGES.WALLET_NOT_FOUND,
            status: HttpStatus.NOT_FOUND,
          };
        }
        let req={
          user:{phoneNo:UserInfo.phoneNo},
          body:{
            amount:data.amount,
            tokenName:"NOSH",
            timeStamp:moment(data.created_at).unix()
          }
        }
        await this.addNoshiesByCard(req,'Bought Noshies By Bank')


      }

      res.sendStatus(200);
      // return { messages: WALLET_MESSAGES.WITHDRAW_SUCCESS, wallet };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async sendNoshies(req) {
    try {
      let { user } = req;

      let UserInfo: any = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      let roles = {
        sender: "FoodLover",
        receiver: "",
      };
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel.findOne({
          phoneNo: user.phoneNo,
        });
        roles.sender = "FoodCreator";
      }
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.WALLET_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { receiverPhoneNo, amount, tokenName, message, timeStamp } = req.body;
      console.log(UserInfo);
      let senderWallet = await this.walletModel.findById(UserInfo.walletId);
      let ReceiverInfo: any = await this.foodLoverModel.findOne({
        phoneNo: receiverPhoneNo,
      });
      roles.receiver = "FoodLover";
      if (!ReceiverInfo) {
        ReceiverInfo = await this.foodCreatorModel.findOne({
          phoneNo: receiverPhoneNo,
        });
        roles.receiver = "FoodCreator";
      }
      let receiverWallet = await this.walletModel.findById(
        ReceiverInfo.walletId
      );
      if (!senderWallet || !receiverWallet) {
        throw WALLET_MESSAGES.WALLET_NOT_FOUND;
      }
      // console.log(receiverWallet,senderWallet)
      let senderAssets = senderWallet.assets.find(
        (asset) => asset.tokenName == tokenName
      );
      let receiverAssets = receiverWallet.assets.find(
        (asset) => asset.tokenName == tokenName
      );
      if (!receiverAssets) {
        let newReceiverAsset = await this.createAsset(
          tokenName,
          receiverWallet,
          amount
        );
        // this.transferTokens(receiverPublicKey,amount,"BNB","test Message")
        senderAssets.amount = senderAssets.amount - amount;
        await senderWallet.save();
        let transaction = await this.createTransaction({
          transactionType: "Sent Noshies",
          timeStamp,
          senderId: UserInfo._id,
          onSenderModel: roles.sender,
          receiverId: ReceiverInfo._id,
          onReceiverModel: roles.receiver,
          from: UserInfo.phoneNo,
          to: ReceiverInfo.phoneNo,
          amount: amount,
          currency: tokenName,
          message,
        });
        this.appGatway.handlesendNoshies(ReceiverInfo.phoneNo, transaction, {
          ReceiverfcmRegistrationToken: ReceiverInfo.fcmRegistrationToken,
          senderUsername: UserInfo.username,
          amount,
        });

        return {
          message: WALLET_MESSAGES.TRANSACTION_SUCCESS,
          // senderAmount: senderAssets.amount,
          // receiverAmount: newReceiverAsset.amount,
          senderWallet,
        };
      } else {
        receiverAssets.amount = receiverAssets.amount + +amount;
        senderAssets.amount = senderAssets.amount - amount;
        await receiverWallet.save();
        await senderWallet.save();
        let transaction = await this.createTransaction({
          transactionType: "Sent Noshies",
          timeStamp,
          senderId: UserInfo._id,
          onSenderModel: roles.sender,
          receiverId: ReceiverInfo._id,
          onReceiverModel: roles.receiver,
          from: UserInfo.phoneNo,
          to: ReceiverInfo.phoneNo,
          amount: amount,
          currency: tokenName,
          message,
        });
        this.appGatway.handlesendNoshies(ReceiverInfo.phoneNo, transaction, {
          ReceiverfcmRegistrationToken: ReceiverInfo.fcmRegistrationToken,
          senderUsername: UserInfo.username,
          amount,
        });
        return {
          message: WALLET_MESSAGES.TRANSACTION_SUCCESS,
          // senderAmount: senderAssets.amount,
          // receiverAmount: receiverAssets.amount,
          senderWallet,
        };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async getNoshifyContacts(req) {
    try {
      let { user } = req;
      let { contacts } = req.body;
      let UserInfo: any = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel.findOne({
          phoneNo: user.phoneNo,
        });
      }
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
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
      console.log(contacts);
      console.log(contacts.length);
      for (let i = 0; i < contacts.length; i++) {
        const user = await this.foodLoverModel
          .findOne({
            $or: [{ phoneNo: contacts[i] }],
          })
          .select("-passHash -pinHash -fcmRegistrationToken");
        console.log(i, user);
        // .populate("walletId", "publicKey");
        if (user) {
          common.push(user);
        }
        // if (req.body.forSent) {
        const anotherUser = await this.foodCreatorModel
          .findOne({
            $or: [{ phoneNo: contacts[i] }],
          })
          .select("-passHash -pinHash");
        // .populate("walletId", "publicKey");
        if (anotherUser) {
          common.push(anotherUser);
        }
        // }
      }
      return { contacts: common };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async checkTransaction(req) {
    let { user } = req;
    const UserInfo = await this.foodLoverModel.findOne({
      phoneNo: user.phoneNo,
    });
    if (!UserInfo) {
      throw {
        msg: WALLET_MESSAGES.USER_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      };
    }
    let fiveMinutesFromNow = new Date().getTime() + 300000;

    let pendingTransaction = await this.createTransaction({
      timeStamp: req.body.timeStamp,
      transactionType: "Bought Noshies By Crypto",
      onSenderModel: "FoodLover",
      senderId: UserInfo._id,
      from: UserInfo.phoneNo,
      amount: req.body.amount,
      memo: req.body.memo,
      currency: req.body.tokenName,
      message: "Test message",
      status: "PENDING",
    });
    let f = 1;
    let task = cron.schedule("*/10 * * * * *", async () => {
      console.log("running a task every 10 sec");
      console.log("USER", UserInfo.phoneNo);
      let transactions = await utils.getTransactions();
      let tx = transactions.tx.find((trans) => trans.memo == req.body.memo);
      console.log(tx);
      if (tx) {
        console.log("here");
        if (f) {
          // if(parseFloat(req.body.bnb))
          let response = await this.payWithCrypto(
            req,
            pendingTransaction,
            tx,
            fiveMinutesFromNow
          );

          this.appGatway.handleReceiveTransaction(UserInfo.phoneNo, {
            response,
          });

          f = 0;
        }
        console.log(tx);
        task.stop();
      } else {
        console.log("No transaction");
        // tx++;
      }
    });
    // let transactions=await utils.getTransactions()
    // let tx=transactions.tx.find(trans=>trans.memo==req.memo)
    // this.appGatway.handleMessage('hello')
    // return tx
    return pendingTransaction;
  }
  async payWithCrypto(req, pendingTransaction, tx, fiveMinutesFromNow) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId");
      let { tokenName } = req.body;
      let wallet = await this.walletModel.findById(UserInfo.walletId);
      if (!wallet) {
        throw {
          msg: WALLET_MESSAGES.WALLET_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      if (wallet.assets) {
        // let asset=wallet.assets.find(asset=>asset.tokenName=='here1')
        let asset = wallet.assets.find((asset) => asset.tokenName == tokenName);
        //if asset exist but not NOSH one
        let amount;
        if (Date.now() > fiveMinutesFromNow) {
          let converted = await utils.bnbToNosh();
          amount = tx.value * converted;
        } else {
          amount = tx.value * req.body.converted;
          // console.log(amount)
        }
        if (!asset) {
          let token = await this.createAsset(tokenName, wallet, amount);
          let successTransaction = await this.transactionsModel.findById(
            pendingTransaction._id
          );
          successTransaction.amount = amount;
          // console.log(successTransaction.amount)
          successTransaction.transactionHash = tx.txHash;
          successTransaction.status = "SUCCESSFUL";
          await successTransaction.save();
          return successTransaction;
        }
        //if  NOSH asset exist
        asset.amount = asset.amount + +amount;
        // console.log("ASSET AMOUNT",asset.amount)
        wallet.save();
        // console.log(wallet)
        let successTransaction = await this.transactionsModel.findById(
          pendingTransaction._id
        );
        successTransaction.amount = amount;
        successTransaction.transactionHash = tx.txHash;
        successTransaction.status = "SUCCESSFUL";
        await successTransaction.save();
        return successTransaction;
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async requestNoshies(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let {
        requestedTophoneNo,
        amount,
        message,
        tokenName,
        timeStamp,
      } = req.body;
      //Receiving Info of user to which we requested NOSH
      let requestReceiverUser: any = await this.foodLoverModel.findOne({
        phoneNo: requestedTophoneNo,
      });
      let requestReceiverRoll = "FoodLover";
      if (!requestReceiverUser) {
        requestReceiverUser = await this.foodCreatorModel.findOne({
          phoneNo: requestedTophoneNo,
        });
        requestReceiverRoll = "FoodCreator";
      }
      //Wallet of user to which we requested NOSH
      let requestReceiverWallet = await this.walletModel.findById(
        requestReceiverUser.walletId
      );
      let transaction = await this.createTransaction({
        transactionType: "Noshies Request",
        timeStamp,
        onSenderModel: "FoodLover",
        senderId: UserInfo._id,
        onReceiverModel: requestReceiverRoll,
        receiverId: requestReceiverUser._id,
        from: UserInfo.phoneNo,
        to: requestedTophoneNo,
        amount,
        currency: tokenName,
        message,
        status: "PENDING",
      });
      // console.log(transaction)
      //PUSHING Request of NOSH in Wallet Schema of Request Receiver
      requestReceiverWallet.requestReceivedForNoshies.push({
        fcmRegistrationToken: UserInfo.fcmRegistrationToken,
        phoneNo: user.phoneNo,
        walletId: UserInfo.walletId,
        amount,
        message,
        tokenName,
        transactionId: transaction._id,
      });
      await requestReceiverWallet.save();

      this.appGatway.handleRequestNoshies(requestedTophoneNo, transaction, {
        requestReceiverfcmRegistrationToken:
          requestReceiverUser.fcmRegistrationToken,
        senderUsername: UserInfo.username,
        amount,
      });
      return { message: "REQUEST SEND" };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async approveRequest(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel.findOne({
          phoneNo: user.phoneNo,
        });
      }
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { transactionId, action } = req.body;
      //Wallet of User that will approve/decline  NOSH request
      let wallet = await this.walletModel.findById(UserInfo.walletId);
      //Taking out thatt request from wallet which is going to be approve or reject
      // console.log(wallet);
      let pendingNoshRequest = wallet.requestReceivedForNoshies.find(
        (request) => {
          return request.transactionId.toString() === transactionId;
        }
      );
      // console.log(pendingNoshRequest);
      //Deleting request in pending request array
      let newList = wallet.requestReceivedForNoshies.filter((request) => {
        return request.transactionId.toString() !== transactionId;
      });
      // console.log(newList);
      //taking out that transaction which need approval
      let transaction = await this.transactionsModel.findById(transactionId);
      console.log(transaction);
      if (action === "ACCEPTED") {
        // console.log(pendingNoshRequest);
        let receiverWallet = await this.walletModel.findById(
          pendingNoshRequest.walletId
        );
        // console.log("FCCMMM",pendingNoshRequest.fcmRegistrationToken)

        // console.log(receiverWallet);
        let senderAssets = wallet.assets.find(
          (asset) => asset.tokenName == pendingNoshRequest.tokenName
        );
        console.log(senderAssets);
        let receiverAssets = receiverWallet.assets.find(
          (asset) => asset.tokenName == pendingNoshRequest.tokenName
        );
        console.log(receiverAssets);
        if (!receiverAssets) {
          //IF ASSET NOSH NOT EXIST
          let newReceiverAsset = await this.createAsset(
            pendingNoshRequest.tokenName,
            receiverWallet,
            pendingNoshRequest.amount
          );
          // this.transferTokens(receiverPublicKey,amount,"BNB","test Message")
          senderAssets.amount = senderAssets.amount - pendingNoshRequest.amount;
          wallet.requestReceivedForNoshies = newList;
          transaction.status = action;
          await wallet.save();
          let updatedTransaction = await transaction.save();

          this.appGatway.handleApproveRequestNoshies(
            pendingNoshRequest.phoneNo,
            updatedTransaction,
            {
              pendingNoshRequestFCM: pendingNoshRequest.fcmRegistrationToken,
              senderUsername: UserInfo.username,
              amount: transaction.amount,
            }
          );

          return {
            message: WALLET_MESSAGES.TRANSACTION_SUCCESS,
            // senderAmount: senderAssets.amount,
            // receiverAmount: newReceiverAsset.amount,
            wallet,
          };
        } else {
          //IF ASSET NOSH EXIST
          receiverAssets.amount =
            receiverAssets.amount + +pendingNoshRequest.amount;
          senderAssets.amount = senderAssets.amount - pendingNoshRequest.amount;
          transaction.status = action;
          wallet.requestReceivedForNoshies = newList;
          await receiverWallet.save();
          await wallet.save();
          let updatedTransaction = await transaction.save();
          console.log(pendingNoshRequest.fcmRegistrationToken);

          this.appGatway.handleApproveRequestNoshies(
            pendingNoshRequest.phoneNo,
            updatedTransaction,
            {
              pendingNoshRequestFCM: pendingNoshRequest.fcmRegistrationToken,
              senderUsername: UserInfo.username,
              amount: transaction.amount,
            }
          );
          return {
            message: WALLET_MESSAGES.TRANSACTION_SUCCESS,
            // senderAmount: senderAssets.amount,
            // receiverAmount: receiverAssets.amount,
            wallet,
          };
        }
      }
      if (action === "DECLINED") {
        transaction.status = action;
        wallet.requestReceivedForNoshies = newList;
        await wallet.save();
        let updatedTransaction = await transaction.save();
        await admin
          .messaging()
          .sendToDevice(pendingNoshRequest.fcmRegistrationToken, {
            notification: {
              title: `${UserInfo.username} Decline Your ${transaction.amount} Noshies Request`,
              body: "Tap to view details",
            },
          });
        this.appGatway.handleApproveRequestNoshies(
          pendingNoshRequest.phoneNo,
          updatedTransaction,
          {
            pendingNoshRequestFCM: pendingNoshRequest.fcmRegistrationToken,
            senderUsername: UserInfo.username,
            amount: transaction.amount,
          }
        );
        return {
          message: "Transaction decline",
        };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }

  async addNoshiesByCard(req, source) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId");
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      // console.log("AAAAAAAAAAAAAAA",UserInfo);
      let { amount, tokenName, timeStamp } = req.body;
      // console.log()
      let wallet = await this.walletModel.findById(UserInfo.walletId);
      // let wallet=UserInfo.walletId.assets
      // console.log("AAAAAAAAAAAAAAA",wallet)
      if (!wallet) {
        throw {
          msg: WALLET_MESSAGES.WALLET_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      if (wallet.assets) {
        // let asset=wallet.assets.find(asset=>asset.tokenName=='here1')
        let asset = wallet.assets.find((asset) => asset.tokenName == tokenName);
        if (!asset) {
          let token = await this.createAsset(tokenName, wallet, amount);
          await this.createTransaction({
            transactionType: source,
            timeStamp,
            from: UserInfo.phoneNo,
            onSenderModel: "FoodLover",
            senderId: UserInfo._id,
            amount,
            currency: tokenName,
            message: "Test message",
            status: "SUCCESSFULL",
          });
          return {
            message: WALLET_MESSAGES.AMOUNT_ADDED_SUCCESS,
            totalAmount: token.amount,
          };
        }
        asset.amount = asset.amount + amount;
        wallet.save();
        // console.log(wallet)
        await this.createTransaction({
          transactionType: source,
          timeStamp,
          onSenderModel: "FoodLover",
          senderId: UserInfo._id,
          from: UserInfo.phoneNo,
          amount,
          currency: tokenName,
          message: "Test message",
          status: "SUCCESSFUL",
        });
        return {
          message: WALLET_MESSAGES.AMOUNT_ADDED_SUCCESS,
          totalAmount: asset.amount,
        };
      } else {
        let token = await this.createAsset(tokenName, wallet, amount);
        await this.createTransaction({
          transactionType: source,
          from: UserInfo.phoneNo,
          onSenderModel: "FoodLover",
          senderId: UserInfo._id,
          timeStamp,
          amount,
          currency: tokenName,
          message: "Test message",
          status: "SUCCESSFULL",
        });
        return {
          message: WALLET_MESSAGES.AMOUNT_ADDED_SUCCESS,
          totalAmount: token.amount,
        };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async getDedicatedAccountNumber(req){
    try {
      let { user } = req;
      let UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      }).populate("walletId").select("walletId");
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
   
      
      return { wallet:UserInfo.walletId };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async createDedicatedAccountNumber(req) {
    try {
      let { user } = req;
      let UserInfo = await this.foodLoverModel.findOneAndUpdate({
        phoneNo: user.phoneNo,
      },{dedicatedCustomer:true});
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let {
        dedicatedAccountName,
        dedicatedAccountNumber,
        dedicatedBankName,
      } = req.body;
      let wallet = await this.walletModel.findByIdAndUpdate(
        UserInfo.walletId,
        {
          dedicatedAccountName,
          dedicatedAccountNumber,
          dedicatedBankName,
        },
        { new: true }
      );
      // console.log(wallet)
      return { wallet };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async getAllAssets(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId");
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel
          .findOne({
            phoneNo: user.phoneNo,
          })
          .populate("walletId");
      }
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      if (!UserInfo.walletId) {
        return { assets: [{ tokenName: "NOSH", amount: 0 }] };
      }
      // console.log(UserInfo.walletId.assets)
      return {
        assets: UserInfo.walletId.assets,
        escrow: UserInfo.walletId.escrow,
      };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async getTransactionOfRequest(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId");
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let transactions = await this.transactionsModel
        .find({
          $or: [{ to: UserInfo.phoneNo }, { from: UserInfo.phoneNo }],
        })
        .populate([
          {
            path: "receiverId",
            select: "username imageUrl",
          },
          {
            path: "senderId",
            select: "username imageUrl",
          },
        ]);
      transactions = transactions.filter(
        (transaction) => transaction.transactionType == "Noshies Request"
      );
      return { transactions };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async getTransactions(req) {
    try {
      // console.log(req.params)
      let { user } = req;
      let UserInfo: any = await this.foodLoverModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId");
      if (!UserInfo) {
        UserInfo = await this.foodCreatorModel
          .findOne({
            phoneNo: user.phoneNo,
          })
          .populate("walletId");
      }
      if (!UserInfo) {
        throw {
          msg: WALLET_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { walletId } = UserInfo;
      let transactions = await this.transactionsModel
        .find({
          $or: [{ to: UserInfo.phoneNo }, { from: UserInfo.phoneNo }],
        })
        .populate([
          {
            path: "receiverId",
            select: "businessName username imageUrl",
          },
          {
            path: "senderId",
            select: "username imageUrl",
          },
        ]);
      if (req.params.assetId) {
        let { assetId } = req.params;
        transactions = transactions.filter(
          (transaction) => transaction.currency == assetId
        );
        return { transactions };
      }
      console.log("getTransaction", transactions);
      return { transactions };
    } catch (error) {
      this.logger.error(error, error.stack);
      console.log(error);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }

  async createAsset(tokenName, wallet, amount) {
    try {
      let token = {
        tokenAddress: "NOSH",
        tokenSymbol: tokenName,
        tokenName,
        amount: parseInt(amount),
      };
      wallet.assets.push(token);
      await wallet.save();
      return token;
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async validation(user) {
    let UserInfo: any = await this.foodLoverModel
      .findOne({
        phoneNo: user.phoneNo,
      })
      .populate("walletId");
    if (!UserInfo) {
      UserInfo = await this.foodCreatorModel
        .findOne({
          phoneNo: user.phoneNo,
        })
        .populate("walletId");
    }
    if (!UserInfo) {
      throw {
        msg: WALLET_MESSAGES.USER_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      };
    }
    return UserInfo;
  }

  async createTransaction(transactionDetails) {
    let newTransaction = new this.transactionsModel(transactionDetails);
    let transaction = await this.transactionsModel.create(newTransaction);
    return transaction;
  }
}
