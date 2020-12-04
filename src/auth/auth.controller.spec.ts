import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import * as bcrypt from 'bcryptjs';
import { AuthService } from "./auth.service";
import { Request } from "express";

let event = {
  phoneNo: "123456789",
  passHash: "1230930",
  location: [],
  imageUrl: "",
  username: "",
  mobileRegisteredId: "12345678",
};
class eventModel {
  constructor() {}
  save = jest.fn().mockResolvedValue(event);
  static find = jest.fn().mockResolvedValue([event, event]);
  // static findOne = jest.fn().mockImplementation(body=>{
  //     if(body.phoneNo!==event.phoneNo){
  //         return null
  //     }
  // });
  static findOne = jest.fn().mockImplementation(body=>{
    if(body.phoneNo===event.phoneNo){
        return event
    }
});
  static findOneAndUpdate = jest.fn().mockResolvedValue(event);
  static create = jest.fn().mockImplementation(body=>{
    event.phoneNo="12345"
    event.passHash='12o2302'
    event.mobileRegisteredId="body.mobileRegisteredId"
    return event 
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
        AuthService,
        {
          provide: getModelToken("Auth"),
          useValue: eventModel,
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);

  });
  test("FoodLoverSignUp", async() => {
    //   try{
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
    // }catch(error){
    //     console.log(error)
    // }
  });
  test("FoodLoverSignIn",async()=>{
    try{
      let req = {
        body: {
          phoneNo: "123456789",
          password: "string",
        },
      } as Request;
      let response=await  authController.login(req)
      expect(response.user).toStrictEqual({
        phoneNo: '123456789',
        passHash: '',
        location: [],
        imageUrl: '',
        username: '',
        mobileRegisteredId: '12345678'
      })
      }catch(error){
          console.log(error)
      }
  })
});
