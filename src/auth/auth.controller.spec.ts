import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { TwilioModule } from "nestjs-twilio";
import { InjectTwilio, TwilioClient } from "nestjs-twilio";
import { Injectable } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
let event = {
  phoneNo: "123456789",
  passHash: "",
  verified: false,
  location: [],
  imageUrl: "",
  username: "",
  mobileRegisteredId: "12345678",
};
class TwillioModel {
  constructor() {}
  static verify = jest.fn();
}
class eventModel {
  constructor() {}
  save = jest.fn().mockResolvedValue(event);
  static find = jest.fn().mockResolvedValue([event, event]);
  // static findOne = jest.fn().mockImplementation(body=>{
  //     if(body.phoneNo!==event.phoneNo){
  //         return null
  //     }
  // });
  static findOne = jest.fn().mockImplementation((body) => {
    if (body.phoneNo === event.phoneNo) {
      return event;
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
@Injectable()
class InjectableService {
  public constructor(@InjectTwilio() public readonly client: TwilioClient) {}
}
describe("AppController", () => {
  let authController: AuthController;
  let verify: jest.Mock;
  let bcryptCompareSync: jest.Mock;
  beforeEach(async () => {
    bcryptCompareSync = jest.fn().mockReturnValue(true);
    verify = jest.fn().mockReturnValue("432571");

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
          provide: InjectableService,
          useValue: TwillioModel,
        },
      ],
      imports: [
        TwilioModule.forRoot({
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
        }),
      ],
    }).compile();
    authController = app.get<AuthController>(AuthController);
  });
  test("FoodLoverSignUp", async () => {
    // let req = {
    //   body: {
    //     phoneNo: "123456789",
    //     password: "string",
    //     mobileRegisteredId: "122343454",
    //   },
    // } as Request;
    // let response=await  authController.signup(req)
    // expect(response.user).toStrictEqual({
    //     phoneNo: '12345',
    //     passHash: '',
    //     location: [],
    //     imageUrl: '',
    //     username: '',
    //     mobileRegisteredId: 'body.mobileRegisteredId'
    //   })
  });
  test("FoodLoverSignIn", async () => {
    let req = {
      body: {
        phoneNo: "123456789",
        password: "string",
      },
    } as Request;
    let response = await authController.login(req);
    expect(response.user).toStrictEqual({
      phoneNo: "123456789",
      passHash: "",
      verified: false,
      location: [],
      imageUrl: "",
      username: "",
      mobileRegisteredId: "12345678",
    });
  });
  test("getLoverInfo", async () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
    } as unknown) as Request;
    let response = await authController.LoverInfo(req);
    expect(response.user).toStrictEqual({
      phoneNo: "123456789",
      passHash: "",
      verified: false,
      location: [],
      imageUrl: "",
      username: "",
      mobileRegisteredId: "12345678",
    });
  });

  test("getUserRegisteredDevice", async () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
    } as unknown) as Request;
    let response = await authController.GetUserRegisteredDevice(req);
    expect(response.mobileRegisteredId).toBe("12345678");
  });
  test("authenticateOTP", () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        otp: "234563",
      },
      // const
    } as unknown) as Request;
  });
});
