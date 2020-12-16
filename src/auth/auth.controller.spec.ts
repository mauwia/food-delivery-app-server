import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { Request, response } from "express";
import { TwilioModule } from "nestjs-twilio";
import { WalletService } from "../wallet/wallet.service";
let OTPToken
let Token = {
    tokenAddress: "21ke909test",
    tokenSymbol: "testSymbol",
    tokenName: "testToken",
    amount: 4,
  };
let wallet = {
    walletAddress: "testAddress",
    publicKey: "testPublicKey",
    encryptedPrivateKey: "testEncryptedPrivateKey",
    assets: [Token],
  };
let event = {
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
  class TransactionModel {
    constructor() {}
    static create = jest.fn();
    save = jest.fn().mockResolvedValue(wallet);
    static find = jest.fn().mockResolvedValue([Transaction]);
    static findOne = jest.fn().mockResolvedValue(wallet);
    //   populate=jest.fn().mockResolvedValue({...})
  }
class walletModel {
    constructor() {}
    save = jest.fn().mockResolvedValue(wallet);
    static find = jest.fn().mockResolvedValue([wallet]);
    static findOne = jest
      .fn()
      .mockResolvedValue({ ...wallet, save: () => jest.fn() });
    //   populate=jest.fn().mockResolvedValue({...})
  }
class eventModel {
  constructor() {}
  static save = jest.fn().mockResolvedValue(event);
  static find = jest.fn().mockResolvedValue([event, event]);
  // signup unit test
//   static findOne = jest.fn().mockImplementation(body=>{
//       if(body.phoneNo!==event.phoneNo){
//           return null
//       }
//   });
//Signin MOCK
  static findOne = jest.fn().mockImplementation((body) => {
    if (body.phoneNo === event.phoneNo) {
        return event
    //    for authenticate OTP and Password and addNewPassword
    //   return {...event,save:jest.fn()};
    }
  });
  static findOneAndUpdate = jest.fn().mockResolvedValue(event);
  static create = jest.fn().mockImplementation((body) => {
    event.phoneNo = "12345";
    event.passHash = "12o2302";
    event.mobileRegisteredId = "body.mobileRegisteredId";
    return event;
  });

  static deleteOne = jest.fn().mockResolvedValue(true);
}

describe("AppController", () => {
  let authController: AuthController;
  let authService:AuthService;
  let bcryptCompareSync: jest.Mock;
  beforeEach(async () => {
    bcryptCompareSync = jest.fn().mockReturnValue(true);
    (bcrypt.compareSync as jest.Mock) = bcryptCompareSync;
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,WalletService,
        {
          provide: getModelToken("Auth"),
          useValue: eventModel,
        },
        {
            provide:getModelToken("Wallet"),
            useValue:walletModel,
        },
        {
            provide: getModelToken("Transactions"),
            useValue: TransactionModel,
        },
      ],
      imports: [
        TwilioModule.forRoot({
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
        })
      ],
    }).compile();
    authController = app.get<AuthController>(AuthController);
    authService=app.get<AuthService>(AuthService)
  });
  test("FoodLoverSignUp", async () => {
    // uncomment findone in eventModal and comment exsiting one
//     let req = {
//       body: {
//         phoneNo: "123456789",
//         password: "string",
//         mobileRegisteredId: "122343454",
//       },
//     } as Request;
//     let response=await  authController.signup(req)
//     expect(response.user).toStrictEqual({
//         phoneNo: '12345',
//         passHash: '',
//         location: [],
//         imageUrl: '',
//         username: '',
//         mobileRegisteredId: 'body.mobileRegisteredId',
//         verified:false
//       })
  });
  test("FoodLoverSignIn", async () => {
    // let req = {
    //   body: {
    //     phoneNo: "123456789",
    //     password: "string",
    //   },
    // } as Request;
    // let response = await authController.login(req);
    // expect(response.user).toStrictEqual({
    //   phoneNo: "123456789",
    //   passHash: "",
    //   verified: false,
    //   location: [],
    //   imageUrl: "",
    //   username: "",
    //   mobileRegisteredId: "12345678",
    // });
  });
  test("getLoverInfo", async () => {
    // let req = ({
    //   user: {
    //     phoneNo: "123456789",
    //   },
    // } as unknown) as Request;
    // let res=await authService.getLoverInfo(req);console.log(res)
    // let response = await authController.LoverInfo(req);
    // expect(response.user).toStrictEqual({
    //   phoneNo: "123456789",
    //   passHash: "",
    //   verified: false,
    //   location: [],
    //   imageUrl: "",
    //   username: "",
    //   mobileRegisteredId: "12345678",
    // });
  });

  test("getUserRegisteredDevice", async () => {
    // let req = ({
    //   body: {
    //    mobileRegisteredId:'12345678',
    //   },
    // } as unknown) as Request;
    // let response = await authController.GetUserRegisteredDevice(req);
    // expect(response.mobileRegisteredId).toBe(true);
  });
  //UNCOMENT findOne() return property for these test
  test("resendOTP",async () => {
    // let req = ({
    //     user: {
    //       phoneNo: "123456789",
    //     },
    //     body:{
    //         codeLength:6
    //     }
    //   } as unknown) as Request;
    // let response=await authController.ResendOTP(req)
    // expect(response).toHaveProperty('code')
  });
  test('authenticateOTP',async ()=>{
    // let req1 = ({
    //     user: {
    //       phoneNo: "123456789",
    //     },
    //     body:{
    //         codeLength:6
    //     }
    //   } as unknown) as Request;
    // let response1=await authController.ResendOTP(req1)
    // let req = ({
    //     user: {
    //       phoneNo: "123456789",
    //     },
    //     body:{
    //         otp:response1.code
    //     }
    //   } as unknown) as Request;
    //   let response=await authController.AuthenticateCode(req)
    //  expect(response.validated).toBe(true)
  })
  test("forgetPassword",async()=>{
    // let req = ({
    //     user: {
    //       phoneNo: "123456789",
    //     },
    //     body:{
    //         codeLength:4
    //     }
    //   } as unknown) as Request;
    // let response=await authController.ForgetPasswordOTP(req)
    // console.log(response)
  })
  test("authenticateForgetPassword",async ()=>{
    //    let req1 = ({
    //     user: {
    //       phoneNo: "123456789",
    //     },
    //     body:{
    //         codeLength:4
    //     }
    //   } as unknown) as Request;
    // let response1=await authController.ResendOTP(req1)
    // let req = ({
    //     user: {
    //       phoneNo: "123456789",
    //     },
    //     body:{
    //         otp:response1.code
    //     }
    //   } as unknown) as Request;
    //   let response=await authController.ForgetPasswordAuthenticateCode(req)
    //  expect(response.validated).toBe(true)
  })
  test("resendPassword",async()=>{
    //     let req = ({
    //     body:{
    //         phoneNo:'123456789',
    //         password:"reset"
    //     }
    //   } as unknown) as Request;
    // let response=await authController.AddNewPassword(req)
    // expect(response.passwordChanged).toBe(true)
  })
});