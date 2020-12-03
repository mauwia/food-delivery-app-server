import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Request } from "express";

let event = {
  phoneNo: "",
  passHash: "",
  location: [],
  imageUrl: "",
  username: "",
  mobileRegisteredId: "",
};
class eventModel {
  constructor() {}
  save = jest.fn().mockResolvedValue(event);
  static find = jest.fn().mockResolvedValue([event, event]);
  static findOne = jest.fn().mockImplementation(body=>{
      if(body.phoneNo!==event.phoneNo){
          return null
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

  beforeEach(async () => {
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
      try{
    let req = {
      body: {
        phoneNo: "123456789",
        password: "string",
        mobileRegisteredId: "122343454",
      },
    } as Request;
    let response=await  authController.signup(req)
    expect(response.user).toStrictEqual({
        phoneNo: '12345',
        passHash: '',
        location: [],
        imageUrl: '',
        username: '',
        mobileRegisteredId: 'body.mobileRegisteredId'
      })
    }catch(error){
        console.log(error)
    }
  });
});
