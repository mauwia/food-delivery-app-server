import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { WalletController } from "./wallet.controller";
import { Request } from "express";
import { WalletService } from "./wallet.service";
import {messaging,initializeApp, ServiceAccount, credential} from "firebase-admin";
import { AppGateway } from "../app.gateway";

let Token = {
  tokenAddress: "21ke909test",
  tokenSymbol: "testSymbol",
  tokenName: "testToken",
  amount: 4,
};
let Token1 = {
  tokenAddress: "21ke909test",
  tokenSymbol: "testSymbol",
  tokenName: "testToken",
  amount: 2,
};
let wallet = {
  _id: "123testId",
  walletAddress: "testAddress",
  publicKey: "testPublicKey",
  encryptedPrivateKey: "testEncryptedPrivateKey",
  assets: [Token],
  requestReceivedForNoshies: [
    { transactionId: "123transactionID", walletId: "123testId1",amount:'1',tokenName:"testToken" },
  ],
};
let wallet1 = {
  _id: "123testId1",
  walletAddress: "testAddress",
  publicKey: "testPublicKey1",
  encryptedPrivateKey: "testEncryptedPrivateKey",
  assets: [Token1],
  requestReceivedForNoshies: [],
};

let User = {
  phoneNo: "123456789",
  passHash: "",
  verified: false,
  location: [],
  imageUrl: "",
  username: "",
  walletId: "123testId",
  mobileRegisteredId: "12345678",
};
let Transaction = {
  transactionType: "Send",
  from: "senderPublicKey",
  to: "recieverPublicKey",
  amount: 4,
  currency: "testToken",
  timeStamp: "9392038182",
  message: "test",
  _id: "123transactionID",
};
class userModel {
  constructor() {}
  save = jest.fn().mockResolvedValue(User);
  static find = jest.fn().mockResolvedValue([User, User]);
  static findOne = jest.fn().mockImplementation((body) => {
    return userModel;
    //for sendNoshies
    // return User;
  });
  static select = jest.fn().mockReturnValue(User);
  static populate = jest.fn().mockResolvedValue({
    // walletId: "123testId",
    // for getAllTransaction,getAllAssets Unit Test
      walletId: { assets: [...wallet.assets, ...wallet.assets] },
  });
}
class walletModel {
  constructor() {}
  save = jest.fn().mockResolvedValue(wallet);
  static find = jest.fn().mockResolvedValue([wallet]);
  static findById = jest.fn().mockImplementation((body) => {
    console.log("=====>", body);
    if (body == "123testId1") {
      return { ...wallet1, save: () => jest.fn() };
    } else if (body == "123testId") {
      console.log(body);
      return { ...wallet, save: () => jest.fn() };
    }
    else{
      return  { ...wallet, save: () => jest.fn() }
    }
  });
  static findOne = jest.fn().mockImplementation((body) => {
    if (body.publicKey == "testPublicKey1") {
      return { ...wallet1, save: () => jest.fn() };
    } else if (body.publicKey == "testPublicKey") {
      return { ...wallet, save: () => jest.fn() };
    }
  });
  // .mockResolvedValue({ ...wallet, save: () => jest.fn() });
  //   populate=jest.fn().mockResolvedValue({...})
}
class TransactionModel {
  constructor() {}
  //   static create = jest.fn();
  save = jest.fn().mockResolvedValue(wallet);
  static find = jest.fn().mockResolvedValue([Transaction]);
  static findOne = jest.fn().mockResolvedValue(wallet);
  static create = jest.fn().mockResolvedValue(Transaction);
  static findById = jest.fn().mockResolvedValue({...Transaction,save:jest.fn()});
    // populate=jest.fn().mockResolvedValue({...})
}

let walletController: WalletController;
describe("WalletController", () => {
  beforeEach(async () => {
   
    
    // initializeApp().options=jest.fn()
    const wallet: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        WalletService,
        AppGateway,
        {
          provide: getModelToken("Wallet"),
          useValue: walletModel,
        },
        {
          provide: getModelToken("FoodLover"),
          useValue: userModel,
        },
        {
          provide: getModelToken("Transactions"),
          useValue: TransactionModel,
        },
        {
          provide: getModelToken("FoodCreator"),
          useValue: userModel,
        },
      ],
    }).compile();
    walletController = wallet.get<WalletController>(WalletController);
  });
  test("getAllAssets", async () => {
    // uncomment first populate Method in userModel
    let req = ({
      user: {
        phoneNo: "123456789",
      },
    } as unknown) as Request;
    let response = await walletController.GetAllAssets(req);
    expect(response.assets).toStrictEqual([
      {
        amount:4,
        tokenAddress: "21ke909test",
        tokenSymbol: "testSymbol",
        tokenName: "testToken",
      },
      {
        amount:4,
        tokenAddress: "21ke909test",
        tokenSymbol: "testSymbol",
        tokenName: "testToken",
      },
    ]);
  });
  test("getAllTransactions", async () => {
    //     let req={
    //         user: {
    //         phoneNo: "123456789",
    //       },
    //       params:{
    //       }
    //     }as unknown as Request
    //     let response=await walletController.GetAllTransactions(req)
    //     expect(response.transactions).toStrictEqual([
    //         {
    //           _id: "123transactionID",
    //           transactionType: 'Send',
    //           from: 'senderPublicKey',
    //           to: 'recieverPublicKey',
    //           amount: 4,
    //           currency: 'testToken',
    //           timeStamp: '9392038182',
    //           message: 'test'
    //         }
    //       ]
    // )
  });
  test("/getTransactionsByAsset/:assetId", async () => {
    // let req={
    //     user: {
    //     phoneNo: "123456789",
    //   },
    //   params:{
    //       assetId:"testToken1"
    //   }
    // }as unknown as Request
    // let response=await walletController.GetAllTransactions(req)
    // expect(response.transactions).toStrictEqual([])
  });
  test("addNoshiesByCard/addNoshiesByBank", async () => {
    let req={
        user:{
            phoneNo:"123456789"
        },
        body:{
            walletId:"123testId",
            timeStamp:Date.now(),
            amount:1,
            tokenName:"testToken"
        }
    }as unknown as Request
    let response=await walletController.AddNoshiesByCard(req)
    expect(response.totalAmount).toBe(5)
  });
  test("getNoshifyContacts", async () => {
        let req={
          user:{phoneNo:"123456789"},
          body:{
            contacts:['12345678']
          }
        }as unknown as Request
        let response=await walletController.GetNoshifyContacts(req)
        // console.log(response)
        expect(response.contacts[0].walletId).toStrictEqual('123testId')
  });
  test("sendNoshies", async () => {
    let req={
      user:{
        phoneNo:"123456789",
      },
      body:{ recieverPhoneNo:"123456789", amount:3, tokenName:"testToken"
      }
    } as unknown as Request
    let response=await walletController.SendNoshies(req)
    expect(response.senderWallet.assets[0].amount).toBe(5)
  });
  test("withdrawNoshies", async () => {
      // let req={
      //   user:{
      //     phoneNo:'123456789'
      //   },
      //   body:{
      //     recieverPhoneNo:"123456789", tokenName:"testToken", amount:3
      //   }
      // }as unknown as Request
      // let response=await walletController.WithdrawNoshies(req)
      // expect(response.wallet.assets[0].amount).toBe(2)
  });
  test("requestNoshies", async () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        requestedTophoneNo: "123456789",
        tokenName: "testToken",
        amount: 3,
      },
    } as unknown) as Request;
      let response=await walletController.RequestNoshies(req)
       expect(response.message).toBe("REQUEST SEND")
  });
  test("approveRequest", async () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        transactionId: "123transactionID",
        action: "ACCEPTED",
      },
    } as unknown) as Request;
    let response = await walletController.ApproveRequest(req);
    expect(response.message).toBe('Transaction complete successfully')
  });
});
