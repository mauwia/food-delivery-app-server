import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Menu, MenuItems } from "./menu.model";
import { FoodCreator } from "../food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";
import { MENU_MESSAGES } from "./constants/key-contants";
import getMenuPipline from "./constants/getMenuPipline";
import { filterPipelineRating,filterPipelineCategory } from "./constants/getFilterPipeline";

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
  async applyFilter(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      var searchKey = new RegExp(req.body.search, "i");
      let { lng, lat } = req.body;
      console.log(req.body);
      let query:any = req.body.rating?filterPipelineRating(lng, lat, searchKey, req.body.rating):filterPipelineCategory(lng, lat, searchKey);
      let nearByFoodCreators = await this.foodCreatorModel
        .find(query)
        .select(
          "-pinHash -passHash -mobileRegisteredId -walletId -verified -fcmRegistrationToken"
        );
      let filterByCategory = [];
      console.log(nearByFoodCreators)
      if (req.body.creatorFoodType) {
        for (let i = 0; i < nearByFoodCreators.length; i++) {
          let { creatorFoodType } = nearByFoodCreators[i];
          for (let j = 0; j < creatorFoodType.length; j++) {
            console.log(creatorFoodType[j])

            if (
              creatorFoodType[j].text == req.body.creatorFoodType &&
              creatorFoodType[j].selected
            ) {
              filterByCategory.push(nearByFoodCreators[i]);
            }
          }
        }
        return filterByCategory;
      }
      return nearByFoodCreators
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

  async getAllCreators(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { lng, lat } = req.body;
      console.log(lng, lat);

      let nearByFoodCreators = await this.foodCreatorModel
        .find({
          $and: [
            {
              location: {
                $near: {
                  $maxDistance: 30000,
                  $geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                  },
                },
              },
            },
            {
              menuExist: true,
            },
          ],
        })
        .select(
          "-pinHash -passHash -mobileRegisteredId -walletId -verified -fcmRegistrationToken"
        );
      console.log(nearByFoodCreators);
      return { nearByFoodCreators };
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
  async getSingleCreatorInfo(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { _id } = req.params;
      let creatorInfo = await this.foodCreatorModel
        .findById(_id)
        .select("-pinHash passHash fcmRegistrationToken");
      return { creatorInfo };
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
  async addMenu(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
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
        throw { msg: MENU_MESSAGES.MENU_EXIST, status: HttpStatus.BAD_REQUEST };
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
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { menuName, menuItem } = req.body;
      let menu = await this.menuModel.findOne({
        $and: [{ foodCreatorId: UserInfo._id }, { menuName }],
      });
      UserInfo.menuExist = true;
      await UserInfo.save();
      if (menu) {
        let newMenuItem = new this.menuItemsModel(menuItem);
        let MenuItem = await this.menuItemsModel.create(newMenuItem);
        if (!UserInfo?.creatorThumbnail) {
          UserInfo.creatorThumbnail = MenuItem.imageUrls[0];
        }
        menu.menuItems.push(MenuItem._id);
        await UserInfo.save();
        await menu.save();
        return { MenuItem };
      } else {
        throw {
          msg: MENU_MESSAGES.MENU_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
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
  async getMenuWithCreatorId(req) {
    try {
      let { user } = req;
      let UserInfo: any = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo)
        UserInfo = await this.foodLoverModel.findOne({
          phoneNo: user.phoneNo,
        });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      // let pipeline = getMenuPipline(req);
      // console.log(req.params.creatorID)
      // let menu = await this.menuModel.aggregate(pipeline);
      // console.log(menu[0])
      //   console.log(nearByFoodCreators2[0]);
      //   console.log(nearByFoodCreators2[1]);
      let menu = await this.menuModel
        .find({ foodCreatorId: req.params.creatorID })
        .populate([
          {
            path: "menuItems",
          },
          {
            path: "foodCreatorId",
            select: "businessName imageUrl",
          },
        ]);
      // console.log("OLLDDD")
      // console.log(menu)
      return { menu };
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
  async deleteMenu(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { menuName } = req.body;
      let deletedMenu = await this.menuModel.findOneAndDelete({
        $and: [{ foodCreatorId: UserInfo._id }, { menuName }],
      });
      let totalMenu = await this.menuModel.countDocuments({
        foodCreatorId: UserInfo._id,
      });
      console.log(totalMenu);
      if (!totalMenu) {
        UserInfo.menuExist = false;
        await UserInfo.save();
      }

      console.log(deletedMenu);
      return { message: "Menu Deleted" };
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
  async editMenu(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { menuName, menuId } = req.body;
      let updatedMenu = await this.menuModel
        .findByIdAndUpdate(
          menuId,
          {
            $set: {
              menuName: menuName,
            },
          },
          { new: true }
        )
        .populate("menuItems");
      return { updatedMenu };
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
  async deleteMenuItem(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let { menuItemId, menuName } = req.body;
      let menu = await this.menuModel.findOneAndUpdate(
        {
          $and: [{ foodCreatorId: UserInfo._id }, { menuName }],
        },
        { $pull: { menuItems: menuItemId } },
        { new: true }
      );
      console.log(menu);
      let deletedMenu = await this.menuItemsModel.findOneAndDelete(menuItemId);
      let totalMenuItem = await this.menuModel.countDocuments({
        foodCreatorId: UserInfo._id,
      });
      console.log(totalMenuItem);
      if (!totalMenuItem) {
        UserInfo.menuExist = false;
        await UserInfo.save();
      }
      return { message: "Menu Item Deleted" };
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
  async editMenuItem(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw {
          msg: MENU_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      let {
        menuItemId,
        imageUrls,
        itemName,
        description,
        preparationTime,
        price,
        discount,
      } = req.body;
      console.log(req.body);
      let menuItem = await this.menuItemsModel.findById(menuItemId);
      console.log(menuItem);
      let updatedMenuItem = await this.menuItemsModel.findOneAndUpdate(
        { _id: menuItemId },
        {
          $set: {
            imageUrls: imageUrls || menuItem.imageUrls,
            itemName: itemName || menuItem.itemName,
            description: description || menuItem.description,
            preparationTime: preparationTime || menuItem.preparationTime,
            price: price || menuItem.price,
            discount: discount || menuItem.discount,
          },
        }
      );
      return { message: "MENU UPDATED" };
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
}
