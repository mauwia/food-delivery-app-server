// import { getModelToken } from "@nestjs/mongoose";
// import { Test, TestingModule } from "@nestjs/testing";
// import { Request } from "express";
// import { OrdersController } from "./orders.controller";
// import { OrdersGateway } from "./orders.gateway";
// import { OrdersService } from "./orders.service";

// describe("OrdersController", () => {
//   let controller: OrdersController;
//   let order={
//     foodCreatorId:"testfoodCreatorId",
//     foodLoverId:"testfoodLoverId",
//     orderStatus:"new",
//     timestamp:1610938293,
//     locationTo:{
//       address:"abc sheet"
//     },
//     orderId:"100",
//     locationFrom:{
//       address:"abc sheet"
//     },
//     orderBill:25,
//     promoCode:"",
//     deliveryCharges:70,
//     orderedFood:"102"
//   }
//   class ordersModel{
//     constructor(){}
//     find=jest.fn().mockResolvedValue(order);
//     create=jest.fn().mockResolvedValue(order)
//   }
//   class foodLoverModel{
//     constructor(){}
//     findOne=jest.fn().mockResolvedValue("order");

//   }
//   class foodCreatorModel{
//     constructor(){}
//     find=jest.fn().mockResolvedValue(order);
//   }
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [OrdersController],
//       providers: [
//         OrdersService,OrdersGateway,
//         {
//           provide: getModelToken("Orders"),
//           useValue: ordersModel,
//         },
//         {
//           provide: getModelToken("FoodLover"),
//           useValue: foodLoverModel,
//         },
//         {
//           provide: getModelToken("FoodCreator"),
//           useValue: foodCreatorModel,
//         },
//       ],
//     }).compile();

//     controller = module.get<OrdersController>(OrdersController);
//   });

//   it("AddOrders", async () => {
//     let req = ({
//       user: {
//         phoneNo: "123456789",
//       },
//       body: {
//         orders: [],
//       },
//     } as unknown) as Request;
//     console.log(foodLoverModel)
//     let response = await controller.CreateOrder(req);
//     console.log(response)
//   });
//   it("should be defined", () => {
//     // expect(controller).toBeDefined();
//   });
// });
it("should be defined", () => {
      // expect(controller).toBeDefined();
    });