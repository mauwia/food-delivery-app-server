import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Request } from "express";
import { ChatService } from "../chat/chat.service";
import { AppGateway } from "../app.gateway";
import { WalletService } from "../wallet/wallet.service";
import { OrdersController } from "./orders.controller";
import { OrdersGateway } from "./orders.gateway";
import { OrdersService } from "./orders.service";
import { ChatGateway } from "../chat/chat.gateway";

describe("OrdersController", () => {
  let controller: OrdersController;
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
  let order={
    foodCreatorId:"testfoodCreatorId",
    foodLoverId:"testfoodLoverId",
    orderStatus:"new",
    timestamp:1610938293,
    locationTo:{
      address:"abc sheet"
    },
    orderId:"100",
    locationFrom:{
      address:"abc sheet"
    },
    orderBill:25,
    promoCode:"",
    deliveryCharges:70,
    orderedFood:"102",
  }
  let MenuItem = {
    imageUrls: ["URL1", "URL2", "URL3"],
    itemName: "Burger",
    description: "DELICIOUS CHICKEN ",
    preparationTime: "1h 5min",
    price: 2000,
    discount: "40",
    reviews: ["Review1", "Review2", "Review3"],
  };
  let Token = {
    tokenAddress: "21ke909test",
    tokenSymbol: "testSymbol",
    tokenName: "testToken",
    amount: 4,
  };
  let foodCreator = {
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
  let message:{

  }
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
  class ordersModel{
    constructor(){}
    static find=jest.fn().mockResolvedValue(ordersModel);
    static populate=jest.fn().mockReturnValue(order)
    create=jest.fn().mockResolvedValue(order)
  }
  
  class MenuItemModel {
    constructor() {}
    static countDocuments=jest.fn().mockResolvedValue(5)
    static create = jest
      .fn()
      .mockResolvedValue({ ...MenuItem, _id: "1233456" });
    static findOne = jest
      .fn()
      .mockResolvedValue({ ...MenuItem, save: jest.fn() });
    static findById = jest.fn().mockResolvedValue(MenuItem);
    static findOneAndUpdate = jest.fn().mockResolvedValue(MenuItem);
    static findOneAndDelete = jest.fn().mockResolvedValue(MenuItem);
  }
  class foodLoverModel{
    constructor(){}
    static findOne=jest.fn().mockResolvedValue(event);

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
  
  class messageModel {
    constructor() {}
    save = jest.fn().mockResolvedValue(wallet);
    static find = jest.fn().mockResolvedValue([wallet]);
    
    // .mockResolvedValue({ ...wallet, save: () => jest.fn() });
    //   populate=jest.fn().mockResolvedValue({...})
  }
  class chatroomModel {
    constructor() {}
    save = jest.fn().mockResolvedValue(wallet);
    static find = jest.fn().mockResolvedValue([wallet]);
    
    // .mockResolvedValue({ ...wallet, save: () => jest.fn() });
    //   populate=jest.fn().mockResolvedValue({...})
  }

  class walletModel {
    constructor() {}
    save = jest.fn().mockResolvedValue(wallet);
    static find = jest.fn().mockResolvedValue([wallet]);
    
    // .mockResolvedValue({ ...wallet, save: () => jest.fn() });
    //   populate=jest.fn().mockResolvedValue({...})
  }
  
  class foodCreatorModel{
    constructor(){}
    static findOne=jest.fn().mockResolvedValue({foodCreator});
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        WalletService,
        ChatService,
        OrdersService,OrdersGateway,
        ChatGateway,
        {
          provide: getModelToken("Orders"),
          useValue: ordersModel,
        },
        {
          provide: getModelToken("FoodLover"),
          useValue: foodLoverModel,
        },
        {
          provide: getModelToken("FoodCreator"),
          useValue: foodCreatorModel,
        },
        {
          provide:getModelToken("MenuItems"),
          useValue:MenuItemModel
        },
        {
          provide:getModelToken("Wallet"),
          useValue:walletModel
        },
        {
          provide:getModelToken("Chatroom"),
          useValue:chatroomModel
        },
        {
          provide:getModelToken("Message"),
          useValue:messageModel
        },
        {
          provide:getModelToken("Transactions"),
          useValue:TransactionModel
        },AppGateway
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it("AddOrders", async () => {
    // let req = ({
    //   user: {
    //     phoneNo: "123456789",
    //   },
    //   body: {
    //     orders: [order],
    //   },
    // } as unknown) as Request;
    // console.log(foodLoverModel)
    // let response = await controller.CreateOrder(req);
    // console.log(response)
  });
  it("getOrders",async ()=>{
    let req = ({
        user: {
          phoneNo: "123456789",
        },
        body: {
          // orders: [order],
          
        },
      } as unknown) as Request;
    let response = await controller.GetOrders(req);
    console.log(response)

  })
//   it("should be defined", () => {
//     // expect(controller).toBeDefined();
//   });
// });
})