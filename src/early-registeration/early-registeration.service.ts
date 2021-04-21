import { Injectable, Logger, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { EarlyRegisteration } from "./early-registeration.model";
import { Model } from "mongoose";

@Injectable()
export class EarlyRegisterationService {
  constructor(
    @InjectModel("EarlyRegisteration")
    private readonly earlyRegisterationModel: Model<EarlyRegisteration>
  ) {}
  private logger = new Logger("Menu");
  async createEarlyAccess(req) {
    try {
        let newAccess=new this.earlyRegisterationModel(req.body)
        let earlyAccess=await this.earlyRegisterationModel.create(newAccess)
        return {msg:"Response Submitted"}
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
