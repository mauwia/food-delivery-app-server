import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Menu, MenuItems } from "./menu.model";
import { FoodCreator,Location } from "../food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";
@Injectable()
export class MenuService {
  constructor(
    @InjectModel("Menu") private readonly menuModel: Model<Menu>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("MenuItems") private readonly menuItemsModel: Model<MenuItems>,
    @InjectModel("Location")
    private readonly locationModel:Model<Location>,
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
    let {long,latt}=req.body
    let foodCreator = await this.locationModel.find({location: {
      $near: {
       $maxDistance: 10000,
       $geometry: {
        type: "Point",
        coordinates: [long, latt]
       }
      }
     }});
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
    try{let { user } = req;
    const UserInfo = await this.foodCreatorModel.findOne({
      phoneNo: user.phoneNo,
    });
    if (!UserInfo) {
      throw { msg: "USER_NOT_FOUND", status: HttpStatus.NOT_FOUND };
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
    else{
      throw { msg: "MENU_NOT_FOUND", status: HttpStatus.NOT_FOUND };
    }
  }catch(error){
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
  async getMenuWithCreatorId(req){
    try{
    let { user } = req;
    let UserInfo:any = await this.foodCreatorModel.findOne({
      phoneNo: user.phoneNo,
    });
    if(!UserInfo)
    UserInfo=await this.foodLoverModel.findOne({
      phoneNo:user.phoneNo
    })
    if (!UserInfo) {
      throw { msg: "USER_NOT_FOUND", status: HttpStatus.NOT_FOUND };
    }
      let menu=await this.menuModel.find({foodCreatorId:req.params.creatorID}).populate("menuItems")
      return {menu}
    }
    catch(error){
      console.log(error)
    }
  }
  async deleteMenu(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw { msg: "USER_NOT_FOUND", status: HttpStatus.NOT_FOUND };
      }
      let { menuName } = req.body;
      let deletedMenu = await this.menuModel.findOneAndDelete({
        $and: [{ foodCreatorId: UserInfo._id }, { menuName }],
      });
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
  async editMenuItem(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw { msg: "USER_NOT_FOUND", status: HttpStatus.NOT_FOUND };
      }
      let {menuId,imageUrls,itemName,description,preparationTime,price,discount}=req.body
      let menuItem=await this.menuItemsModel.findById(menuId)
      let updatedMenuItem=await this.menuItemsModel.findOneAndUpdate({_id:menuId},{
        $set:{
          imageUrls:imageUrls||menuItem.imageUrls,
          itemName:itemName||menuItem.itemName,
          description:description||menuItem.description,
          preparationTime:preparationTime||menuItem.preparationTime,
          price:price||menuItem.price,
          discount:discount||menuItem.discount
        }
      })
      return {message:"WALLET UPDATED"}
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