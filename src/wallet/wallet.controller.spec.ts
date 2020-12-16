import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { WalletController } from "./wallet.controller";
import { Request } from "express";
import { WalletService } from "./wallet.service";

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
  walletAddress: "testAddress",
  publicKey: "testPublicKey",
  encryptedPrivateKey: "testEncryptedPrivateKey",
  assets: [Token],
};
let wallet1 = {
  walletAddress: "testAddress",
  publicKey: "testPublicKey1",
  encryptedPrivateKey: "testEncryptedPrivateKey",
  assets: [Token1],
};
let User = {
  phoneNo: "123456789",
  passHash: "",
  verified: false,
  location: [],
  imageUrl: "",
  username: "",
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
};
class userModel {
  constructor() {}
  save = jest.fn().mockResolvedValue(User);
  static find = jest.fn().mockResolvedValue([User, User]);
  static findOne = jest.fn().mockImplementation((body) => {
    return userModel;
  });
  static select = jest.fn().mockReturnValue(userModel);
  static populate = jest.fn().mockResolvedValue({
    walletId: { public: wallet.publicKey },
    // for getAllTransaction Unit Test
    //   walletId: { assets: [...wallet.assets, ...wallet.assets] },
  });
}
class walletModel {
  constructor() {}
  save = jest.fn().mockResolvedValue(wallet);
  static find = jest.fn().mockResolvedValue([wallet]);
  static findOne = jest
    .fn()
    .mockImplementation(body=>{
      if(body.publicKey=="testPublicKey1")
      {
       return {...wallet1, save: () => jest.fn() }
      }
      else if(body.publicKey=="testPublicKey"){
        return {...wallet, save: () => jest.fn() }
      }
    })
    // .mockResolvedValue({ ...wallet, save: () => jest.fn() });
  //   populate=jest.fn().mockResolvedValue({...})
}
class TransactionModel {
  constructor() {}
  static create = jest.fn();
  save = jest.fn().mockResolvedValue(wallet);
  static find = jest.fn().mockResolvedValue([Transaction]);
  static findOne = jest.fn().mockResolvedValue(wallet);
  //   populate=jest.fn().mockResolvedValue({...})
}

let walletController: WalletController;
describe("WalletController", () => {
  beforeEach(async () => {
    const wallet: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        WalletService,
        {
          provide: getModelToken("Wallet"),
          useValue: walletModel,
        },
        {
          provide: getModelToken("Auth"),
          useValue: userModel,
        },
        {
          provide: getModelToken("Transactions"),
          useValue: TransactionModel,
        },
      ],
    }).compile();
    walletController = wallet.get<WalletController>(WalletController);
  });
  test("getAllAssets", async () => {
    // uncomment first populate Method in userModel
    // let req = ({
    //   user: {
    //     phoneNo: "123456789",
    //   },
    // } as unknown) as Request;
    // let response = await walletController.GetAllAssets(req);
    // expect(response.assets).toStrictEqual([
    //   {
    //     tokenAddress: "21ke909test",
    //     tokenSymbol: "testSymbol",
    //     tokenName: "testToken",
    //   },
    //   {
    //     tokenAddress: "21ke909test",
    //     tokenSymbol: "testSymbol",
    //     tokenName: "testToken",
    //   },
    // ]);
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
    // let req={
    //     user:{
    //         phoneNo:"123456789"
    //     },
    //     body:{
    //         publicKey:"testPublicKey",
    //         amount:1,
    //         tokenName:"testToken"
    //     }
    // }as unknown as Request
    // let response=await walletController.AddNoshiesByCard(req)
    // expect(response.totalAmount).toBe(5)
  });
  test("getNoshifyContacts", async () => {
    // let req={
    //   user:{phoneNo:"123456789"},
    //   body:{
    //     contacts:['12345678']
    //   }
    // }as unknown as Request
    // let response=await walletController.GetNoshifyContacts(req)
    // expect(response.contacts[0]).toStrictEqual({walletId:{
    //       public: "testPublicKey",
    //      }})
  });
  test("sendNoshies",async ()=>{
    // let req={
    //   user:{
    //     phoneNo:"123456789",
    //   },
    //   body:{
    //     senderPublicKey:"testPublicKey", recieverPublicKey:"testPublicKey1", amount:3, tokenName:"testToken"
    //   }
    // } as unknown as Request
    // let response=await walletController.SendNoshies(req)
    // expect(response.senderWallet.assets[0].amount).toBe(1)
  })
  test("withdrawNoshies",async ()  => {
      // let req={
      //   user:{
      //     phoneNo:'123456789'
      //   },
      //   body:{
      //     publicKey:"testPublicKey", tokenName:"testToken", amount:3
      //   }
      // }as unknown as Request
      // let response=await walletController.WithdrawNoshies(req)
      // expect(response.wallet.assets[0].amount).toBe(1)
  })
});
