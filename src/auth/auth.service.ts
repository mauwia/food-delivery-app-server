import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
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
  async signinLover(req: { phone_no: string; password: string }) {
    try {
      const userExist = await this.authModel.findOne({
        phone_no: req.phone_no,
      });
      if (!userExist) {
        throw "User Doesnot Exist";
      }
      if (!bcrypt.compareSync(req.password, userExist.pass_hash))
        throw "Wrong Password";
      const token = jwt.sign(
        { phone_no: userExist.phone_no },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      const user = {
        user: userExist,
        token,
      };
      return user;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async signupLover(req: {
    phone_no: string;
    pass_hash: string;
    password: string;
    mobile_registered_id: string;
  }) {
    try {
      const uniqueNumber = await this.authModel.findOne({
        phone_no: req.phone_no,
      });
      if (!uniqueNumber) {
        req.pass_hash = bcrypt.hashSync(req.password, 8);
        delete req.password;

        const newUser = new this.authModel(req);
        const user = await this.authModel.create(newUser);
        const token = jwt.sign(
          { phone_no: req.phone_no },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
        );
        let CodeDigit = Math.floor(100000 + Math.random() * 900000);
        let OTPCode = {
          CodeDigit,
          createdAt: new Date(),
          expiresAt: utils.expiryCodeGenerator(),
        };
        this.OTP.push(OTPCode);
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
        phone_no: user.phone_no,
      });
      if (!UserInfo) {
        throw "User Not Found";
      }
      return { user: UserInfo };
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
  async authenticateOTP(req) {
    try {
      let { user } = req;
      const UserInfo = await this.authModel.findOne({
        phone_no: user.phone_no,
      });
      if (!UserInfo) {
        throw "User Not Found";
      } else {
        let checked = utils.checkExpiry(this.OTP, req.body.otp);
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
}
