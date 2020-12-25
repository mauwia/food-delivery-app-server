import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { request } from "express";
import { Model } from "mongoose";
import { FOOD_CREATOR_MESSAGES } from "./constants/key-constant";
import { FoodCreator } from "./food-creator.model";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
@Injectable()
export class FoodCreatorService {
  constructor(
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>
  ) {}
  private logger = new Logger("Food Creator");
  async signinCreator(req) {
    try {
      const userExist = await this.foodCreatorModel.findOne({
        phoneNo: req.phoneNo,
      });
      if (!userExist) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_EXIST;
      }
      if (!bcrypt.compareSync(req.password, userExist.passHash)) {
        throw FOOD_CREATOR_MESSAGES.WRONG_PASSWORD;
      }
      const token = jwt.sign(
        { phoneNo: userExist.phoneNo },
        process.env.JWT_ACCESS_TOKEN_SECRET
      );
      userExist.passHash = "";
      return {
        user: userExist,
        token,
      };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          msg: error,
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
  async signupCreator(req) {
    try {
      const uniqueNumber = await this.foodCreatorModel.findOne({
        phoneNo: req.phoneNo,
      });
      if (!uniqueNumber) {
        req.passHash = bcrypt.hashSync(req.password, 8);
        delete req.password;
        const newUser = new this.foodCreatorModel(req);
        const user = await this.foodCreatorModel.create(newUser);
        const token = jwt.sign(
          { phoneNo: req.phoneNo },
          process.env.JWT_ACCESS_TOKEN_SECRET
        );
        user.passHash = "";
        return { token, user };
      } else {
        throw FOOD_CREATOR_MESSAGES.USER_EXIST;
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          msg: error,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
