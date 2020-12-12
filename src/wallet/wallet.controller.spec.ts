import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { WalletController } from "./wallet.controller";
import { Request } from "express";
import { use } from "passport";
import { WalletService } from "./wallet.service";

let Token = {
  tokenAddress: "21ke909test",
  tokenSymbol: "testSymbol",
  tokenName: "testToken",
  amount:4
};
let wallet = {
  walletAddress: "testAddress",
  publicKey: "testPublicKey",
  encryptedPrivateKey: "testEncryptedPrivateKey",
  assets: [Token],
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
    if (body.phoneNo === User.phoneNo) {
      return userModel;
    }
  });
  static populate = jest
    .fn()
    .mockResolvedValue({
        walletId:wallet.publicKey
    // for getAllTransaction Unit Test 
    //   walletId: { assets: [...wallet.assets, ...wallet.assets] },
    });
}
class walletModel {
  constructor() {}
  save = jest.fn().mockResolvedValue(wallet);
  static find = jest.fn().mockResolvedValue([wallet]);
  static findOne = jest.fn().mockResolvedValue({...wallet,save:()=>jest.fn()});
  //   populate=jest.fn().mockResolvedValue({...})
}
class TransactionModel {
  constructor() {}
  static create=jest.fn()
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
  test("getAllAsset", async () => {
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
  test("getAllTransactions",async ()=>{
    let req={
        user: {
        phoneNo: "123456789",
      },
      params:{
      }
    }as unknown as Request
    let response=await walletController.GetAllTransactions(req)
    expect(response.transactions).toStrictEqual([
        {
          transactionType: 'Send',
          from: 'senderPublicKey',
          to: 'recieverPublicKey',
          amount: 4,
          currency: 'testToken',
          timeStamp: '9392038182',
          message: 'test'
        }
      ]
)
  })
  test("/getTransactionsByAsset/:assetId",async ()=>{
    let req={
        user: {
        phoneNo: "123456789",
      },
      params:{
          assetId:"testToken1"
      }
    }as unknown as Request
    let response=await walletController.GetAllTransactions(req)
    expect(response.transactions).toStrictEqual([])
  })
  test("addNoshiesByCard/addNoshiesByBank",async()=>{
    let req={
        user:{
            phoneNo:"123456789"
        },
        body:{
            publicKey:"testPublicKey",
            amount:1,
            tokenName:"testToken"
        }
    }as unknown as Request
    let response=await walletController.AddNoshiesByCard(req)
    expect(response.totalAmount).toBe(5)
  })
});
