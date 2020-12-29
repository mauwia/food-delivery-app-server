import { HttpException, HttpStatus, Injectable,Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FoodLover } from "src/foodLover/foodLover.model";
import { Orders } from "./orders.model";
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>
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
      const newOrder = new this.ordersModel(req.body);
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
