import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectTwilio, TwilioClient } from "nestjs-twilio";
import { Model } from "mongoose";
import { Auth } from "./auth.model";
import { AUTH_MESSAGES } from "./constants/key-contants";
import { WalletService } from "../wallet/wallet.service";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
@Injectable()
export class AuthService {
  constructor(
    @InjectModel("Auth") private readonly authModel: Model<Auth>,
    @InjectTwilio() private readonly client: TwilioClient,
    private readonly walletService: WalletService
  ) {}
  OTP = [];
  async signinLover(req: { phoneNo: string; password: string }) {
    try {
      const userExist = await this.authModel.findOne({
        phoneNo: req.phoneNo,
      });
      if (!userExist) {
        throw AUTH_MESSAGES.USER_NOT_EXIST;
      }
      if (!bcrypt.compareSync(req.password, userExist.passHash))
        throw AUTH_MESSAGES.WRONG_PASSWORD;

      const token = jwt.sign(
        { phoneNo: userExist.phoneNo },
        process.env.JWT_ACCESS_TOKEN_SECRET
      );
      if (!userExist.verified) {
        await this.sendSMS(userExist.phoneNo);

        userExist.passHash = "";
        return { user: userExist, token };
      }
      userExist.passHash = "";
      return {
        user: userExist,
        token,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          msg: error,
        },
        HttpStatus.UNAUTHORIZED
      );
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
          process.env.JWT_ACCESS_TOKEN_SECRET
        );
        await this.sendSMS(req.phoneNo);

        user.passHash = "";
        return { token, user };
      } else {
        throw AUTH_MESSAGES.USER_EXIST;
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          msg: error,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async getLoverInfo(req) {
    try {
      let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw AUTH_MESSAGES.USER_NOT_FOUND;
      }
      UserInfo.passHash = "";
      return { user: UserInfo };
    } catch (error) {
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
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw AUTH_MESSAGES.USER_NOT_FOUND;
      } else {
        let { otp } = req.body;
        let check = await this.checkSmsVerification(
          UserInfo.phoneNo,
          otp,
          otp.length
        );
        let checked = {
          validated: check.valid,
          message: check.status,
        };
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
        error == AUTH_MESSAGES.INVALID_OTP ||
        error == AUTH_MESSAGES.OTP_EXPIRED
      ) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            msg: error,
            validated: false,
          },
          HttpStatus.UNAUTHORIZED
        );
      } else
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
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw AUTH_MESSAGES.USER_NOT_FOUND;
      } else {
        await this.sendSMS(user.phoneNo, req.body.codeLength);
        return { result: "Code Sent" };
      }
    } catch (error) {
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
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw AUTH_MESSAGES.USER_NOT_FOUND;
      } else {
        UserInfo.passHash = bcrypt.hashSync(req.body.password, 8);
        delete req.body.password;
        await UserInfo.save();
        return { passwordChanged: true };
      }
    } catch (error) {
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
      const UserInfo = await this.authModel.find({
        mobileRegisteredId:req.body.mobileRegisteredId
      });
      if (!UserInfo) {
        throw AUTH_MESSAGES.USER_NOT_FOUND;
      } else {
        // console.log(UserInfo)
        return { mobileRegisteredId: UserInfo.length>0 };
      }
    } catch (error) {
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
      const UserInfo = await this.authModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw AUTH_MESSAGES.USER_NOT_FOUND;
      } else {
        UserInfo.pinHash = bcrypt.hashSync(req.body.pin, 8);
        let wallet = await this.walletService.createWallet();
        let getBalance = await this.walletService.getBalance(
          wallet.createAccount.address
        );
        UserInfo.walletId=wallet.wallet_id
        await UserInfo.save();
        delete wallet.wallet_id
        return { message: "Pin Saved", createAccount:wallet.createAccount, getBalance };
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          msg: error,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  async sendSMS(phoneNo, codeLength = 6) {
    try {
      // let service=await this.client.verify.services.create({friendlyName: 'OTP'})
      // console.log(service.sid)
      let response = await this.client.verify
        .services(
          codeLength == 6
            ? process.env.TWILIO_SERVICE_ID_6
            : process.env.TWILIO_SERVICE_ID_4
        )
        .verifications.create({ to: phoneNo, channel: "sms" });
      return response;
    } catch (e) {
      return e;
    }
  }
  async checkSmsVerification(phoneNo, code, codeLength = 6) {
    try {
      let response = await this.client.verify
        .services(
          codeLength == 6
            ? process.env.TWILIO_SERVICE_ID_6
            : process.env.TWILIO_SERVICE_ID_4
        )
        .verificationChecks.create({ to: phoneNo, code });
      return response;
    } catch (e) {
      return e;
    }
  }
}
