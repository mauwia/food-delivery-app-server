import { HttpException, HttpStatus, Injectable,Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FoodCreator } from "src/food-creator/food-creator.model";
import { FoodLover } from "src/foodLover/foodLover.model";
import { pad } from "src/utils";
import { Orders } from "./orders.model";
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator") private readonly foodCreatorModel:Model<FoodCreator>
  ) {}
  private logger=new Logger("Wallet")
  async createOrder(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
      let {body}=req
      let foodCreator=await this.foodCreatorModel.findOne({_id:body.foodCreatorId})
      let incrementOrder = (+foodCreator.totalOrders) + 1;
      foodCreator.totalOrders=pad(incrementOrder,foodCreator.totalOrders.length)
      await foodCreator.save()
      const newOrder = new this.ordersModel(req.body);
      newOrder.orderId="#"+pad(incrementOrder,foodCreator.totalOrders.length)
      const order = await this.ordersModel.create(newOrder);
      return { order };
    } catch (error) {
      this.logger.error(error,error.stack)
        throw new HttpException(
            {
                status:HttpStatus.NOT_FOUND,
                msg:error
            },HttpStatus.NOT_FOUND
        )
    }
  }
  async checkPromo(req){
      try{
        let { user } = req;
      const UserInfo = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "USER_NOT_FOUND";
      }
    let promos=['Nosh40',"Dec20","AB12"]
      let check=promos.filter((promo)=>req.body.promoCode===promo)
      if(check.length){
          return {promoCode:true}
      }else{
        return {promoCode:false}
      }
      }
      catch(error){
        this.logger.error(error,error.stack)
        throw new HttpException(
            {
                status:HttpStatus.NOT_FOUND,
                msg:error
            },HttpStatus.NOT_FOUND
        )
      }
  }
}
