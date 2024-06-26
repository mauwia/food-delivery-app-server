import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { FoodCreatorController } from "./food-creator.controller";
import * as bcrypt from "bcryptjs";
import { FoodCreatorService } from "./food-creator.service";
import { Request } from "express";
import { TwilioModule } from "nestjs-twilio";
import { WalletService } from "../wallet/wallet.service";
import { AppGateway } from "../app.gateway";
let OTPToken;
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
  _id: "11230302koewk",
};
let event = {
  phoneNo: "123456789",
  passHash: "",
  verified: false,
  pinHash: false,
  location: [],
  imageUrl: "",
  username: "",
  mobileRegisteredId: "12345678",
  fcmRegistrationToken:[]
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
  static create = jest.fn().mockImplementation((body) => {
    return event;
  });
}
class eventModel {
  constructor() {}
  static save = jest.fn().mockResolvedValue(event);
  static find = jest.fn().mockResolvedValue([event, event]);
  // signup unit test
  // static findOne = jest.fn().mockImplementation((body) => {
  //   if (body.phoneNo !== event.phoneNo) {
  //     return null;
  //   }
  // });
  //Signin MOCK
  static findOne = jest.fn().mockImplementation((body) => {
    if (body.phoneNo === event.phoneNo) {
      // return event
      //    for authenticate OTP and Password and addNewPassword
      return { ...event, save: jest.fn() };
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
class FoodCreatorModel {
  constructor() {}
  static save = jest.fn().mockResolvedValue(event);
  static find = jest.fn().mockResolvedValue([event, event]);
  // signup unit test
  // static findOne = jest.fn().mockImplementation(body=>{
  //     if(body.phoneNo!==event.phoneNo){
  //         return null
  //     }
  // });
  //Signin MOCK
  static findOne = jest.fn().mockImplementation((body) => {
    if (body.phoneNo === event.phoneNo) {
      // return event;
      //    for authenticate OTP and Password and addNewPassword
      return { ...event, save: jest.fn() };
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
describe("FoodCreatorController", () => {
  let foodCreatorController: FoodCreatorController;
  let foodCreatorService: FoodCreatorService;
  let bcryptCompareSync: jest.Mock;
  beforeEach(async () => {
    bcryptCompareSync = jest.fn().mockReturnValue(true);
    (bcrypt.compareSync as jest.Mock) = bcryptCompareSync;
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FoodCreatorController],
      providers: [
        FoodCreatorService,
        WalletService,
        AppGateway,
        {
          provide: getModelToken("FoodLover"),
          useValue: eventModel,
        },
        {
          provide: getModelToken("Wallet"),
          useValue: walletModel,
        },
        {
          provide: getModelToken("Transactions"),
          useValue: TransactionModel,
        },
        {
          provide: getModelToken("FoodCreator"),
          useValue: FoodCreatorModel,
        },
      ],
      imports: [
        TwilioModule.forRoot({
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
        }),
      ],
    }).compile();
    foodCreatorController = app.get<FoodCreatorController>(
      FoodCreatorController
    );
    foodCreatorService = app.get<FoodCreatorService>(FoodCreatorService);
  });
  test("FoodLoverSignUp", async () => {
    // uncomment findone in eventModal and comment other one
    // let req = {
    //   body: {
    //     phoneNo: "123456789",
    //     password: "string",
    //     mobileRegisteredId: "122343454",
    //   },
    // } as Request;
    // let response = await foodCreatorController.signup(req);
    // expect(response.user).toStrictEqual({
    //   phoneNo: "12345",
    //   passHash: "",
    //   pinHash:false,
    //   location: [],
    //   imageUrl: "",
    //   username: "",
    //   mobileRegisteredId: "body.mobileRegisteredId",
    //   verified: false,
    // });
  });
  test("FoodLoverSignIn", async () => {
    
    let req = {
      body: {
        phoneNo: "123456789",
        password: "string",
      },
    } as Request;
    let response = await foodCreatorController.login(req);

    expect(response.user.phoneNo).toBe("123456789");
  });
  test("getLoverInfo", async () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
    } as unknown) as Request;
    let response = await foodCreatorController.getCreatorInfo(req);
    expect(response.user.phoneNo).toBe("123456789");
  });

  test("getUserRegisteredDevice", async () => {
    let req = ({
      body: {
        mobileRegisteredId: "12345678",
      },
    } as unknown) as Request;
    let response = await foodCreatorController.GetUserRegisteredDevice(req);
    expect(response.mobileRegisteredId).toBe(true);
  });
  //UNCOMENT findOne() return property for these test
  test("resendOTP", async () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        codeLength: 6,
      },
    } as unknown) as Request;
    let response = await foodCreatorController.ResendOTP(req);
    expect(response).toHaveProperty("code");
  });
  test("authenticateOTP", async () => {
    let req1 = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        codeLength: 6,
      },
    } as unknown) as Request;
    let response1 = await foodCreatorController.ResendOTP(req1);
    let req = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        otp: response1.code,
      },
    } as unknown) as Request;
    let response = await foodCreatorController.AuthenticateCode(req);
    expect(response.validated).toBe(true);
  });
  test("forgetPassword", async () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        codeLength: 4,
      },
    } as unknown) as Request;
    let response = await foodCreatorController.ForgetPasswordOTP(req);
    console.log(response);
  });
  test("authenticateForgetPassword", async () => {
    let req1 = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        codeLength: 4,
      },
    } as unknown) as Request;
    let response1 = await foodCreatorController.ResendOTP(req1);
    let req = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        otp: response1.code,
      },
    } as unknown) as Request;
    let response = await foodCreatorController.ForgetPasswordAuthenticateCode(
      req
    );
    expect(response.validated).toBe(true);
  });
  test("resendPassword", async () => {
    try {
      let req = ({
        body: {
          phoneNo: "123456789",
          password: "reset",
        },
      } as unknown) as Request;
      let response = await foodCreatorController.AddNewPassword(req);
      expect(response.passwordChanged).toBe(true);
    } catch (error) {
      expect(error.status).toBe(406)
    }
  });
});
