import { Test, TestingModule } from "@nestjs/testing";
import { MenuController } from "./menu.controller";
import { getModelToken } from "@nestjs/mongoose";
import { Request } from "express";
import { MenuService } from "./menu.service";

describe("MenuController", () => {
  let menuController: MenuController;
  let Menu = {
    foodCreatorId: "js92je920020211",
    menuItems: ["123456789", "987654321"],
    menuName: [],
  };
  let MenuItem = {
    imageUrls: ["URL1", "URL2", "URL3"],
    itemName: "Burger",
    description: "DELICIOUS CHICKEN ",
    preparationTime: "1h 5min",
    price: 2000,
    discount: "40",
    reviews: ["Review1", "Review2", "Review3"],
  };
  let foodCreator = {
    phoneNo: "123456789",
    _id:"testId1234"
  };
  class foodCreatorModel{
    constructor(){}
    static findOne=jest.fn().mockResolvedValue(foodCreator)
  }
  class MenuModel {
    constructor(){}
    static create=jest.fn().mockResolvedValue(Menu)
    static findOne=jest.fn().mockResolvedValue(null)
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        MenuService,
        {
          provide: getModelToken("Menu"),
          useValue: MenuModel,
        },
        {
          provide: getModelToken("MenuItems"),
          useValue: MenuModel,
        },
        {
          provide: getModelToken("FoodCreator"),
          useValue: foodCreatorModel,
        },
        {
          provide: getModelToken("FoodLover"),
          useValue: MenuModel,
        },
      ],
    }).compile();

    menuController = module.get<MenuController>(MenuController);
  });

  test("addMenu", async () => {
    let req = {
      user: {
        phoneNo: "123456789",
      },
      body: {
        menuName: "Chicken",
      },
    } as unknown as Request;
    let response = await menuController.AddMenu(req);
    expect(response).toStrictEqual( {
      menu: {
        foodCreatorId: 'js92je920020211',
        menuItems: [ '123456789', '987654321' ],
        menuName: []
      }
    }
)
  });
});
