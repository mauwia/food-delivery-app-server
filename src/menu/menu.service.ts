import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Menu } from "./menu.model";
import { FoodCreator } from "../food-creator/food-creator.model";
@Injectable()
export class MenuService {
  constructor(
    @InjectModel("Menu") private readonly menuModel: Model<Menu>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>
  ) {}
  async getAllCreators(req) {
    let { user } = req;
    const UserInfo = await this.foodCreatorModel.findOne({
      phoneNo: user.phoneNo,
    });
    if (!UserInfo) {
      throw "USER_NOT_FOUND";
    }
    let foodCreator= await this.foodCreatorModel.find({})
    return {foodCreator}
}
}
