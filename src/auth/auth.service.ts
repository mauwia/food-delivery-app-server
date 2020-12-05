import {
  Injectable,
  HttpStatus,HttpException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
// import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { Model } from "mongoose";
import { Auth } from "./auth.model";
import * as utils from "../utils";
import { userInfo } from "os";
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
      if(!userExist.verified){
        let CodeDigit = Math.floor(100000 + Math.random() * 900000);
        let OTPCode = {
          CodeDigit,
          phoneNo:userExist.phoneNo,
          createdAt: new Date(),
          expiresAt: utils.expiryCodeGenerator(),
        };
        this.OTP.push(OTPCode);
        return {user:userExist,token,code: OTPCode.CodeDigit}
      }
      userExist.passHash = "";
      return {
        user: userExist,
        token,
      };
    } catch (error) {
      throw new HttpException({
        status:HttpStatus.UNAUTHORIZED,
        msg:error
      },HttpStatus.UNAUTHORIZED);
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
      // console.log(uniqueNumber)
      if (!uniqueNumber) {
        req.passHash = bcrypt.hashSync(req.password, 8);
        delete req.password;

        const newUser = new this.authModel(req);
        const user = await this.authModel.create(newUser);
        const token = jwt.sign(
          { phoneNo: req.phoneNo },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          
        );
        // let codeResp=await this.sendSMS()
        // console.log(codeResp)
        let CodeDigit = Math.floor(100000 + Math.random() * 900000);
        let OTPCode = {
          CodeDigit,
          phoneNo:user.phoneNo,
          createdAt: new Date(),
          expiresAt: utils.expiryCodeGenerator(),
        };
        this.OTP.push(OTPCode);
        user.passHash = "";
        return { token, user, code: OTPCode.CodeDigit };
      } else {
        throw "User Already Exist";
      }
    } catch (error) {
      // console.log(error)
      // throw new BadRequestException(error);
      throw new HttpException({
        status:HttpStatus.BAD_REQUEST,
        msg:error
      },HttpStatus.BAD_REQUEST);
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
    } catch (error) {
      throw new HttpException({
        status:HttpStatus.NOT_FOUND,
        msg:error
      },HttpStatus.NOT_FOUND);
    }
  }
  async authenticateOTP_and_forgetPasswordOTP(req) {
    try {
      let user=req.user?req.user:req.body
      // let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User Not Found";
      } else {
        let checked = utils.checkExpiry(this.OTP, req.body.otp,UserInfo.phoneNo);
        if (!checked.validated) {
          throw checked.message;
        } else {
          UserInfo.verified=true
          await UserInfo.save()
          return  checked ;
        }
      }
    } catch (error) {
      if (error == "Invalid OTP" || error == "OTP Expired")
        { 
          throw new HttpException({
          status:HttpStatus.UNAUTHORIZED,
          msg:error,
          validated:false
        },HttpStatus.UNAUTHORIZED);
      }
      else throw new HttpException({
        status:HttpStatus.NOT_FOUND,
        msg:error
      },HttpStatus.NOT_FOUND);
    }
  }
  async resendOTP_and_forgetPasswordOtp(req) {
    try {
        let user=req.user?req.user:req.body
        // let { user } = req;
        const UserInfo = await this.authModel.findOne({
          phoneNo: user.phoneNo,
        });
        if (!UserInfo) {
          throw "User Not Found";
        } else{

            let CodeDigit = req.body.codeLength==6?Math.floor(100000 + Math.random() * 900000):Math.floor(1000 + Math.random() * 9000);
            let OTPCode = {
              CodeDigit,
              phoneNo:UserInfo.phoneNo,
              createdAt: new Date(),
              expiresAt: utils.expiryCodeGenerator(),
            };
            this.OTP.push(OTPCode);
            return {code: OTPCode.CodeDigit }
        }

    } catch (error) {
      throw new HttpException({
        status:HttpStatus.NOT_FOUND,
        msg:error
      },HttpStatus.NOT_FOUND);
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
        UserInfo.passHash = bcrypt.hashSync(req.body.password, 8);
        delete req.body.password;
        await UserInfo.save()
        return {passwordChanged:true}
      }

    }
    catch(error){
      throw new HttpException({
        status:HttpStatus.NOT_FOUND,
        msg:error
      },HttpStatus.NOT_FOUND);
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
    }catch(error){
      throw new HttpException({
        status:HttpStatus.NOT_FOUND,
        msg:error
      },HttpStatus.NOT_FOUND);
    }
  }
  async createTransactionPin(req){
    try{
      let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User Not Found";
      }
      else{
        UserInfo.pinHash = bcrypt.hashSync(req.body.pin, 8);
        await UserInfo.save()
        return {message:'Pin Saved'}
      }
    }catch(error){
      throw new HttpException({
        status:HttpStatus.NOT_FOUND,
        msg:error
      },HttpStatus.NOT_FOUND);
    }
  }
  // async sendSMS() {
  //   try {
  //     // let service=await this.client.verify.services.create({friendlyName: 'My First Verify Service'})
  //     // console.log(service.sid)
  //     let response=await this.client.verify.services(process.env.TWILIO_SERVICE_ID)
  //     .verifications
  //     .create({to: '+923343058887', channel: 'sms'})
  //     .then(verification => console.log(verification.status));
  //     return response
  //   } catch (e) {
  //     return e;
  //   }
  // }
 
}
