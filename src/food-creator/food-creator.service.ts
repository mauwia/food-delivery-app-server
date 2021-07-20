import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FoodLover } from "../foodLover/foodLover.model";
import { WalletService } from "../wallet/wallet.service";
import * as utils from "../utils";
import { FOOD_CREATOR_MESSAGES } from "./constants/key-constant";
import { FoodCreator } from "./food-creator.model";
import { Testers } from "src/profile/profile.model";
import { AdminNotification } from 'src/admin/admin-notification/admin-notifications.model'
import { AdminGateway } from "src/admin/admin.gateway";
import { AdminNotificationService } from "src/admin/admin-notification/admin-notification.service";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
@Injectable()
export class FoodCreatorService {
  constructor(
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("FoodLover")
    private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("Testers") private readonly testerModel:Model<Testers>,
    @InjectModel("AdminNotification") private readonly notificationModel:Model<AdminNotification>,
    private readonly walletService: WalletService,
    private readonly adminGateway: AdminGateway,
    private readonly notificationService: AdminNotificationService,
  ) {}
  OTP = [];
  private logger = new Logger("Food Creator");
  async signinCreator(req) {
    try {
      // const isAlphaTester=await this.testerModel.findOne({phoneNo:req.phoneNo})
      // if(!isAlphaTester){
      //   throw "you are not authorized to access this app"
      // }
      const userExist = await this.foodCreatorModel.findOne({
        phoneNo: req.phoneNo,
      });

      if (!userExist) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_EXIST;
      }
      if (!bcrypt.compareSync(req.password, userExist.passHash)) {
        throw FOOD_CREATOR_MESSAGES.WRONG_PASSWORD;
      }
      let tokenExist = userExist.fcmRegistrationToken.find(
        (token) => token === req.fcmRegistrationToken
      );
      if (!tokenExist) {
        userExist.fcmRegistrationToken.push(req.fcmRegistrationToken);
        await userExist.save();
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
      let uniqueNumber = await this.foodCreatorModel.findOne({
        phoneNo: req.phoneNo,
      });
      let uniqueNumberInLover;
      if (!uniqueNumber) {
        uniqueNumberInLover = await this.foodLoverModel.findOne({
          phoneNo: req.phoneNo,
        });
      }
      if (!uniqueNumber && !uniqueNumberInLover) {
        req.passHash = bcrypt.hashSync(req.password, 8);
        delete req.password;
        // const denver = { type: 'Point', coordinates: [-104.9903, 39.7392] };
        // req.location=denver
        const newUser = new this.foodCreatorModel(req);
        const user = await this.foodCreatorModel.create(newUser);

        const notification = await this.notificationService.saveNotification('newFc', user);
        this.adminGateway.handleFCSignup({ notification, user });

        const token = jwt.sign(
          { phoneNo: req.phoneNo },
          process.env.JWT_ACCESS_TOKEN_SECRET
        );
        // await this.sendSMS(req.phoneNo);
        // let CodeDigit = Math.floor(100000 + Math.random() * 900000);
        // let OTPCode = {
        //   CodeDigit,
        //   phoneNo: user.phoneNo,
        //   createdAt: new Date(),
        //   expiresAt: utils.expiryCodeGenerator(),
        // };
        // this.OTP.push(OTPCode);
        user.pinHash = !!user.pinHash;
        user.passHash = "";
        return { token, user };
      } else if (uniqueNumberInLover) {
        throw FOOD_CREATOR_MESSAGES.USER_EXIST_IN_FL;
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

      let UserInfo: any = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        UserInfo = await this.foodLoverModel.findOne({
          phoneNo: user.phoneNo,
        });
      }
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      }
      if (req.params.username) {
        let user = await this.foodCreatorModel.findOne({username:req.params.username});
        return { user };
      }
      // let location=await this.locationModel.find({foodCreatorId:UserInfo._id})
      // UserInfo.location=location
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
            let getWallet = await this.walletService.createWallet();
            // console.log(getWallet.wallet._id)
            UserInfo.walletId = getWallet.wallet._id;
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
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: req.body.phoneNo,
      });

      if (!UserInfo) {
        throw {
          msg: FOOD_CREATOR_MESSAGES.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      if (bcrypt.compareSync(req.body.password, UserInfo.passHash)) {
        throw {
          msg: FOOD_CREATOR_MESSAGES.EXIST_PASS,
          status: HttpStatus.NOT_ACCEPTABLE,
        };
      }
      UserInfo.passHash = bcrypt.hashSync(req.body.password, 8);
      delete req.body.password;
      await UserInfo.save();
      return { passwordChanged: true };
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
        await UserInfo.save();
        return {
          message: "Pin Saved Your Current Balance Is 0",
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
  async logout(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      }
      await this.foodCreatorModel.findOneAndUpdate(
        { phoneNo: user.phoneNo },
        {
          $pull: { fcmRegistrationToken: req.body.fcmRegistrationToken },
        }
      );
      return { message: "Logout Success" };
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
  async addImportantDetails(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      }
      if (req.body.username) {
        let usernameCheck = await this.foodCreatorModel.findOne({
          username: req.body.username,
        });
        if (usernameCheck && usernameCheck.phoneNo !== UserInfo.phoneNo) {
          throw "Username already in use";
        }
      }
      if (req.body.email) {
        let emailCheck = await this.foodCreatorModel.findOne({
          email: req.body.email,
        });
        console.log(emailCheck);
        if (emailCheck && emailCheck.phoneNo !== UserInfo.phoneNo) {
          throw "Email already in use";
        }
      }
      UserInfo.businessName = req.body.businessName;
      UserInfo.username = req.body.username;
      UserInfo.email = req.body.email;
      UserInfo.addressComponents=req.body.addressComponents
      // this.addCreatorLocation(req)
      // UserInfo.location.push(req.body.location)
      UserInfo.location = req.body.location;
      await UserInfo.save();
      let CodeDigit = Math.floor(100000 + Math.random() * 900000);
      let OTPCode = {
        CodeDigit,
        phoneNo: user.phoneNo,
        createdAt: new Date(),
        expiresAt: utils.expiryCodeGenerator(),
      };
      this.OTP.push(OTPCode);
      return { message: "Info Saved", code: OTPCode.CodeDigit };
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
  async toggleStatus(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw FOOD_CREATOR_MESSAGES.USER_NOT_FOUND;
      }
      UserInfo.onlineStatus = !UserInfo.onlineStatus;
      await UserInfo.save();
      return { status: UserInfo.onlineStatus };
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
}
