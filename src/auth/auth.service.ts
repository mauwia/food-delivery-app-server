import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Auth } from "./auth.model";
import * as utils from "../utils";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
@Injectable()
export class AuthService {
  constructor(@InjectModel("Auth") private readonly authModel: Model<Auth>) {}
  OTP = [];
  async signinLover(req: { phoneNo: string; password: string }) {
    try {
      const userExist = await this.authModel.findOne({
        phoneNo: req.phoneNo,
      });
      if (!userExist) {
        throw "User Doesnot Exist";
      }
      if (!bcrypt.compareSync(req.password, userExist.passHash))
        throw "Wrong Password";
      const token = jwt.sign(
        { phoneNo: userExist.phoneNo },
        process.env.JWT_ACCESS_TOKEN_SECRET,
      );
      userExist.passHash = "";
      return {
        user: userExist,
        token,
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async signupLover(req: {
    phoneNo: string;
    passHash: string;
    password: string;
    mobileRegisteredId: string;
  }) {
    try {
      const uniqueNumber = await this.authModel.findOne({
        phoneNo: req.phoneNo,
      });
      console.log(uniqueNumber)
      if (!uniqueNumber) {
        req.passHash = bcrypt.hashSync(req.password, 8);
        delete req.password;

        const newUser = new this.authModel(req);
        const user = await this.authModel.create(newUser);
        const token = jwt.sign(
          { phoneNo: req.phoneNo },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          
        );
        let CodeDigit = Math.floor(100000 + Math.random() * 900000);
        let OTPCode = {
          CodeDigit,
          phoneNo:user.phoneNo,
          createdAt: new Date(),
          expiresAt: utils.expiryCodeGenerator(),
        };
        this.OTP.push(OTPCode);
        user.passHash = "";
        return { token, user, Code: OTPCode.CodeDigit };
      } else {
        throw "User Already Exist";
      }
    } catch (error) {
      // console.log(error)
      throw new BadRequestException(error);
    }
  }
  async getLoverInfo(req) {
    try {
      let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User Not Found";
      }
      UserInfo.passHash = "";
      return { user: UserInfo };
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
  async authenticateOTP(req) {
    try {
      let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User Not Found";
      } else {
        let checked = utils.checkExpiry(this.OTP, req.body.otp,UserInfo.phoneNo);
        if (!checked.validation) {
          throw checked.message;
        } else {
          return { checked };
        }
      }
    } catch (e) {
      if (e == "Invalid OTP" || e == "OTP Expired")
        throw new UnauthorizedException(e);
      else throw new NotFoundException(e);
    }
  }
  async resendOTP(req) {
    try {
        let { user } = req;
        const UserInfo = await this.authModel.findOne({
          phoneNo: user.phoneNo,
        });
        if (!UserInfo) {
          throw "User Not Found";
        } else{
            let CodeDigit = Math.floor(100000 + Math.random() * 900000);
            let OTPCode = {
              CodeDigit,
              phoneNo:UserInfo.phoneNo,
              createdAt: new Date(),
              expiresAt: utils.expiryCodeGenerator(),
            };
            this.OTP.push(OTPCode);
            return {Code: OTPCode.CodeDigit }
        }

    } catch (e) {
        throw new NotFoundException(e)
    }
  }
  async addNewPassword(req){
    try{
      let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User Not Found";
      }else{
        // UserInfo.
        UserInfo.passHash = bcrypt.hashSync(req.body.password, 8);
        delete req.body.password;
        await UserInfo.save()
        return {passwordChanged:true}
      }

    }
    catch(e){
      throw new NotFoundException(e)
    }
  }
  async getUserRegisteredDevice(req){
    try{
      let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User Not Found";
      }
      else{
        return {mobileRegisteredId:UserInfo.mobileRegisteredId}
      }
    }catch(e){
      throw new NotFoundException(e)
    }
  }
}
