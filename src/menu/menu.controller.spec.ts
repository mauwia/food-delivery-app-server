import { Test, TestingModule } from "@nestjs/testing";
import { MenuController } from "./menu.controller";
import { getModelToken } from "@nestjs/mongoose";
import { Request } from "express";
import { MenuService } from "./menu.service";

describe("MenuController", () => {
  let menuController: MenuController;
  let Menu = {
    _id: "12345678",
    foodCreatorId: "js92je920020211",
    menuItems: ["123456789", "987654321"],
    menuName: "Chicken",
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
    _id: "testId1234",
  };
  class foodCreatorModel {
    constructor() {}
    static findOne = jest.fn().mockResolvedValue(foodCreator);
    static find = jest.fn().mockReturnValue(foodCreatorModel);
    static select = jest.fn().mockResolvedValue([foodCreator]);
  }
  class MenuModel {
    constructor() {}
    static create = jest.fn().mockResolvedValue(Menu);
    // static findOne=jest.fn().mockResolvedValue(null) //for addMenu
    static findOne = jest.fn().mockResolvedValue({ ...Menu, save: jest.fn() }); //for addMenuItem
    static findByIdAndUpdate = jest.fn().mockImplementation((body) => {
      if (body === Menu._id) {
        Menu.menuName = "Burger";
      }
      return MenuModel;
    });
    static findOneAndUpdate = jest.fn().mockResolvedValue(Menu);
    static populate = jest.fn().mockResolvedValue(Menu);
    static findOneAndDelete = jest.fn().mockResolvedValue(Menu);
  }
  class MenuItemModel {
    constructor() {}
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
          useValue: MenuItemModel,
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
    //     let req = {
    //       user: {
    //         phoneNo: "123456789",
    //       },
    //       body: {
    //         menuName: "Chicken",
    //       },
    //     } as unknown as Request;
    //     let response = await menuController.AddMenu(req);
    //     expect(response).toStrictEqual( {
    //       menu: {
    //         foodCreatorId: 'js92je920020211',
    //         menuItems: [ '123456789', '987654321' ],
    //         menuName: "Chicken"
    //       }
    //     }
    // )
  });
  test("addMenuItem", async () => {
    // let req = {
    //   user: {
    //     phoneNo: "123456789",
    //   },
    //   body: {
    //     menuName: "Chicken",
    //     menuItem:{
    //       itemName:"Grill",
    //       description:"DESCRIPTION DETAIL",
    //       price:20,
    //       preparationTime:'1hr 5min'
    //     },
    //   },
    // } as unknown as Request;
    // let response = await menuController.AddMenuItem(req);
    // expect(Menu.menuItems[2]).toBe("1233456")
  });
  test("editMenu", async () => {
    //     let req = ({
    //       user: {
    //         phoneNo: "123456789",
    //       },
    //       body: {
    //         menuName: "Burger",
    //         menuId: "12345678",
    //       },
    //     } as unknown) as Request;
    //     let response = await menuController.EditMenu(req);
    //     expect(response.updatedMenu).toStrictEqual({
    //       _id: '12345678',
    //       foodCreatorId: 'js92je920020211',
    //       menuItems: [ '123456789', '987654321' ],
    //       menuName: 'Burger'
    //     }
    // )
  });
  test("editMenuItem", async () => {
    // let req = ({
    //   user: {
    //     phoneNo: "123456789",
    //   },
    //   body: {
    //     itemName: "Grill",
    //     menuItemId: "123456789",
    //   },
    // } as unknown) as Request;
    // let response = await menuController.EditMenuItem(req);
    //  console.log(response)
  });
  test("deleteMenu", async () => {
    //   let req = ({
    //   user: {
    //     phoneNo: "123456789",
    //   },
    //   body: {
    //    menuName:"Chicken"
    //   },
    // } as unknown) as Request;
    // let response = await menuController.DeleteMenu(req);
    // expect(response.message).toBe("Menu Deleted")
  });
  test("deleteMenuItem", async () => {
    // let req = ({
    //   user: {
    //     phoneNo: "123456789",
    //   },
    //   body: {
    //    menuName:"Chicken",
    //    menuItemId: "123456789",
    //   },
    // } as unknown) as Request;
    // let response = await menuController.DeleteMenuItem(req);
    //     expect(response.message).toBe("Menu Item Deleted")
  });
  test("getAllCreators", async () => {
    let req = ({
      user: {
        phoneNo: "123456789",
      },
      body: {
        lng: 27.234556,
        lat: 69.06092,
      },
      params: {
        creatorID: "123456789",
      },
    } as unknown) as Request;
    let response = await menuController.GetAllCreators(req);
        expect(response.nearByFoodCreators).toStrictEqual([ { phoneNo: '123456789', _id: 'testId1234' } ])
  });
});
