import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Menu, MenuItems } from "./menu.model";
import { FoodCreator } from "../food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";
@Injectable()
export class MenuService {
  constructor(
    @InjectModel("Menu") private readonly menuModel: Model<Menu>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("MenuItems") private readonly menuItemsModel: Model<MenuItems>
  ) {}
  private logger = new Logger("Menu");
  async getAllCreators(req) {
    let { user } = req;
    const UserInfo = await this.foodLoverModel.findOne({
      phoneNo: user.phoneNo,
    });
    if (!UserInfo) {
      throw "USER_NOT_FOUND";
    }
    let foodCreator = await this.foodCreatorModel.find({});
    return { foodCreator };
  }
  async addMenu(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw { msg: "USER_NOT_FOUND", status: HttpStatus.NOT_FOUND };
      }
      let { menuName } = req.body;
      let checkMenu = await this.menuModel.findOne({
        $and: [{ foodCreatorId: UserInfo._id }, { menuName }],
      });
      if (!checkMenu) {
        let newMenu = new this.menuModel({
          foodCreatorId: UserInfo._id,
          menuName,
        });
        let menu = await this.menuModel.create(newMenu);
        return { menu };
      } else {
        throw { msg: "MENU_ALREADY_EXIST", status: HttpStatus.BAD_REQUEST };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: error.status,
          msg: error.msg,
        },
        error.status
      );
    }
  }
  async addMenuItem(req) {
    let { user } = req;
    const UserInfo = await this.foodCreatorModel.findOne({
      phoneNo: user.phoneNo,
    });
    if (!UserInfo) {
      throw "USER_NOT_FOUND";
    }
    let { menuName, menuItem } = req.body;
    let menu = await this.menuModel.findOne({
      $and: [{ foodCreatorId: UserInfo._id }, { menuName }],
    });
    if (menu) {
      let newMenuItem = new this.menuItemsModel(menuItem);
      let MenuItem = await this.menuItemsModel.create(newMenuItem);
      menu.menuItems.push(MenuItem._id);
      await menu.save();
      return { MenuItem };
    }
  }
  async deleteMenu(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
      phoneNo: user.phoneNo,
    });
    if (!UserInfo) {
      throw "USER_NOT_FOUND";
    }
    let {menuName}=req.body
    } catch (error) {}
  }
}
