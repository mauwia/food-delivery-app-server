import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WalletService } from "src/wallet/wallet.service";
import * as utils from "../utils";
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
    private readonly foodCreatorModel: Model<FoodCreator>,
    private readonly walletService:WalletService
  ) {}
  OTP = [];
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
      // console.log(token)
      if (!userExist.verified) {
        let CodeDigit = Math.floor(100000 + Math.random() * 900000);
        let OTPCode = {
          CodeDigit,
          phoneNo: userExist.phoneNo,
          createdAt: new Date(),
          expiresAt: utils.expiryCodeGenerator(),
        };
        this.OTP.push(OTPCode);
        userExist.pinHash = !!userExist.pinHash;
        userExist.passHash = "";
        return { user: userExist, token, code: OTPCode.CodeDigit };
      }
      userExist.pinHash = !!userExist.pinHash;
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
        // await this.sendSMS(req.phoneNo);
        let CodeDigit = Math.floor(100000 + Math.random() * 900000);
        let OTPCode = {
          CodeDigit,
          phoneNo: user.phoneNo,
          createdAt: new Date(),
          expiresAt: utils.expiryCodeGenerator(),
        };
        this.OTP.push(OTPCode);
        user.pinHash = !!user.pinHash;
        user.passHash = "";
        return { token, user, code: OTPCode.CodeDigit };
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
  async getCreatorInfo(req) {
    try {
      let { user } = req;
      // console.log(user)
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      }
      UserInfo.passHash = "";
      return { user: UserInfo };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async authenticateOTP_and_forgetPasswordOTP(req) {
    try {
      let user = req.user ? req.user : req.body;
      // let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      } else {
        // let { otp } = req.body;
        let checked = utils.checkExpiry(
          this.OTP,
          req.body.otp,
          UserInfo.phoneNo
        );
        // let check = await this.checkSmsVerification(
        //   UserInfo.phoneNo,
        //   otp,
        //   otp.length
        // );
        // let checked = {
        //   validated: check.valid,
        //   message: check.status,
        // };
        if (!checked.validated) {
          throw checked.message;
        } else {
          if (req.user) {
            UserInfo.verified = req.user ? true : false;
          }
          await UserInfo.save();
          return checked;
        }
      }
    } catch (error) {
      if (
        error == FOOD_CREATOR_MESSAGES.INVALID_OTP ||
        error == FOOD_CREATOR_MESSAGES.OTP_EXPIRED
      ) {
        this.logger.error(error, error.stack);
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            msg: error,
            validated: false,
          },
          HttpStatus.UNAUTHORIZED
        );
      } else this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async resendOTP_and_forgetPasswordOtp(req) {
    try {
      let user = req.user ? req.user : req.body;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      } else {
        // await this.sendSMS(user.phoneNo, req.body.codeLength);
        let CodeDigit =
          req.body.codeLength == 6
            ? Math.floor(100000 + Math.random() * 900000)
            : Math.floor(1000 + Math.random() * 9000);
        let OTPCode = {
          CodeDigit,
          phoneNo: UserInfo.phoneNo,
          createdAt: new Date(),
          expiresAt: utils.expiryCodeGenerator(),
        };
        this.OTP.push(OTPCode);
        return { code: OTPCode.CodeDigit };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async addNewPassword(req) {
    try {
      let user = req.user ? req.user : req.body;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      } else {
        UserInfo.passHash = bcrypt.hashSync(req.body.password, 8);
        delete req.body.password;
        await UserInfo.save();
        return { passwordChanged: true };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async getUserRegisteredDevice(req) {
    try {
      const UserInfo = await this.foodCreatorModel.find({
        mobileRegisteredId: req.body.mobileRegisteredId,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      } else {
        // console.log(UserInfo)
        return { mobileRegisteredId: UserInfo.length > 0 };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async createTransactionPin(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      } else {
        UserInfo.pinHash = bcrypt.hashSync(req.body.pin, 8);
        let getWallet = await this.walletService.createWallet();
        let getBalance = await this.walletService.getBalance(
          getWallet.wallet._id
        );
        // console.log(getWallet.wallet._id)
        UserInfo.walletId = getWallet.wallet._id;
        return {
            message: "Pin Saved Your Current Balance Is 0",
          getBalance,
        };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async verifyPin(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      }
      if (!bcrypt.compareSync(req.body.pin, UserInfo.pinHash))
        return { verified: false };
      else {
        return { verified: true };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async addImportantDetails(req){
    try{
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      }
      UserInfo.businessName=req.body.businessName
      UserInfo.location.push(req.body.location)
      await UserInfo.save()
      return {message:"Info Saved"}
    }
    catch(error){
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
  async toggleStatus(req){
    try{
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      }
      UserInfo.onlineStatus=!UserInfo.onlineStatus
      await UserInfo.save()
      return {status:UserInfo.onlineStatus}
    }
    catch(error){
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
}
