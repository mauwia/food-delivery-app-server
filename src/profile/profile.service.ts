import { Model } from "mongoose";
import {
  Injectable,
  HttpStatus,
  HttpException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PROFILE_MESSAGES, PROFILE_DATA } from "./constants/key-constants";
import { Workbook } from "exceljs";
import * as tmp from "tmp";
import { writeFile } from "fs/promises";
import { FoodLover } from "../foodLover/foodLover.model";
import { FoodCreator } from "../food-creator/food-creator.model";
import { Orders } from "src/orders/orders.model";
import { Testers } from "./profile.model";
const bcrypt = require("bcryptjs");
import { AdminGateway } from "src/admin/admin.gateway";
import { AdminNotificationService } from "src/admin/admin-notification/admin-notification.service";

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("Testers") private readonly testerModel: Model<Testers>,
    private readonly adminNotificationService: AdminNotificationService,
    private readonly adminGateway: AdminGateway,
  ) {}
  private logger = new Logger("Profile");

  async updateProfile(request, query) {
    let pinHash: string;
    let newAccount;
    let {
      user,
      body,
    }: {
      user: { phoneNo: string };
      body: {
        password: string;
        creatorUrls: string;
        description: string;
        addressComponents:any
        phoneNo: string;
        verified: boolean;
        firstName: string;
        lastName: string;
        username: string;
        businessName: string;
        imageUrl: string;
        location: [];
        mobileRegisteredId: string;
        email: string;
        pin: string;
        customerCode: string;
        creatorThumbnail: string;
        creatorFoodType: Array<string>;
      };
    } = request;
    let userType = query.user as string;

    if (this.isValidUsertype(query)) {
      let model;
      if (userType === "fl") {
        model = this.foodLoverModel;
      } else {
        model = this.foodCreatorModel;
      }

      try {
        if (body.phoneNo) {
          let numberInLover;
          let numberInCreator;

          numberInLover = await this.foodLoverModel.findOne({
            phoneNo: body.phoneNo,
          });
          if (!numberInLover) {
            numberInCreator = await this.foodCreatorModel.findOne({
              phoneNo: body.phoneNo,
            });
          }
          if (numberInLover || numberInCreator) {
            throw PROFILE_MESSAGES.NUMBER_IN_USE;
          }
        }
        const userProfile = await model.findOne({
          phoneNo: user.phoneNo,
        });
        console.log(body);
        if (userProfile) {
          if (body.pin) {
            if (!bcrypt.compareSync(body.password, userProfile.passHash))
              throw PROFILE_MESSAGES.WRONG_PASSWORD;
            pinHash = bcrypt.hashSync(body.pin, 8);
          }
          if (body.username) {
            let usernameCheck = await model.findOne({
              username: body.username,
            });
            console.log(usernameCheck);
            if (
              usernameCheck &&
              usernameCheck.phoneNo !== userProfile.phoneNo
            ) {
              throw "Username already in use";
            }
          }
          if (body.email) {
            let emailCheck = await model.findOne({ email: body.email });
            console.log(emailCheck);
            if (emailCheck && emailCheck.phoneNo !== userProfile.phoneNo) {
              throw "Email already in use";
            }
            if (!emailCheck) {
              newAccount = true;
            }
          }
          const updatedProfile = await model
            .findOneAndUpdate(
              { phoneNo: user.phoneNo },
              {
                $set: {
                  phoneNo: body.phoneNo || userProfile.phoneNo,
                  verified: body.verified || userProfile.verified,
                  email: body.email || userProfile.email,
                  username: body.username || userProfile.username,
                  addressComponents:body.addressComponents||userProfile.addressComponents,
                  imageUrl: body.imageUrl || userProfile.imageUrl,
                  location: body.location || userProfile.location,
                  pinHash: pinHash || userProfile.pinHash,
                  mobileRegisteredId:
                    body.mobileRegisteredId || userProfile.mobileRegisteredId,
                  ...(userType === "fl" && {
                    firstName: body.firstName || userProfile.firstName,
                    lastName: body.lastName || userProfile.lastName,
                    customerCode: body.customerCode || userProfile.customerCode,
                  }),
                  ...(userType === "fc" && {
                    creatorThumbnail:
                      body.creatorThumbnail || userProfile.creatorThumbnail,
                      creatorUrls: body.creatorUrls || userProfile.creatorUrls,
                    description: body.description || userProfile.description,
                    businessName: body.businessName || userProfile.businessName,
                    creatorFoodType:
                      body.creatorFoodType || userProfile.creatorFoodType,
                  }),
                },
              },
              { new: true, fields: { passHash: 0, __v: 0 } }
            )
            .lean();
          updatedProfile.pinHash = !!updatedProfile.pinHash;
          if (newAccount && userType === 'fl') {
            this.adminGateway.sendWelcomeEmail(
              updatedProfile,
              process.env.FL_WELCOME_EMAIL_TEMPLATE_ID,
              'food lover',
            );
          }

          if (newAccount && userType === 'fc') {
            this.adminGateway.sendWelcomeEmail(
              updatedProfile,
              process.env.FC_WELCOME_EMAIL_TEMPLATE_ID,
              'food creator'
            );
          }
          let totalOrders = await this.ordersModel.countDocuments({
            foodLoverId: userProfile._id,
            orderStatus: "Order Completed",
          });
          return { ...updatedProfile, totalOrders };
        } else {
          throw PROFILE_MESSAGES.USER_NOT_FOUND;
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

  async updatePassword(request, query) {
    let {
      user,
      body,
    }: {
      user: { phoneNo: string };
      body: { oldPassword: string; newPassword: string };
    } = request;
    let userType = query.user as string;

    if (this.isValidUsertype(query)) {
      try {
        let model;
        if (userType === "fl") {
          model = this.foodLoverModel;
        } else {
          model = this.foodCreatorModel;
        }

        let userProfile = await model.findOne({
          phoneNo: user.phoneNo,
        });
        if (!bcrypt.compareSync(body.oldPassword, userProfile.passHash))
          throw PROFILE_MESSAGES.WRONG_PASSWORD;
        if (bcrypt.compareSync(body.newPassword, userProfile.passHash)) {
          throw PROFILE_MESSAGES.ADD_NEW_PASSWORD;
        }
        if (userProfile) {
          userProfile.passHash = bcrypt.hashSync(body.newPassword, 8);
          await userProfile.save();
          return {
            passwordUpdated: true,
          };
        } else {
          throw new BadRequestException(PROFILE_MESSAGES.USER_NOT_FOUND);
        }
      } catch (error) {
        this.logger.error(error, error.stack);
        throw new BadRequestException(error);
      }
    }
  }

  isValidUsertype(query) {
    let userType = query.user as string;

    if (!userType) {
      throw new BadRequestException(PROFILE_MESSAGES.SPECIFY_USER_TYPE);
    }

    if (!PROFILE_DATA.USER_TYPES.includes(`${userType}`)) {
      throw new BadRequestException(PROFILE_MESSAGES.INVALID_USER_TYPE);
    }

    return true;
  }
  async addAlphas(req) {
    try {
      await this.testerModel.collection.insertMany(req.body.testers);
      return { message: "Tester added succcussfully" };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }
  async getAllFCs() {
    try {
      let data = await this.foodCreatorModel
        .find({})
        .select(
          "-_id -__v -passHash -fcmRegistrationToken -customerCode -pinHash"
        )
        .lean();
    
      let rows = [];
      data.forEach((doc) => {
        rows.push(Object.values(doc));
      });
      let book = new Workbook();
      let sheet = book.addWorksheet(`sheet1`);
      rows.unshift(Object.keys(data[0]));
      sheet.addRows(rows);
      let File = await new Promise((resolve, reject) => {
        tmp.file(
          {
            discardDescriptor: true,
            prefix: `NoshifyTesterFC`,
            postfix: ".xlsx",
            mode: parseInt("0600", 8),
          },
          async (err, file) => {
            if (err) {
              throw new BadRequestException(err);
            }
            book.xlsx
              .writeFile(file)
              .then((_) => {
                resolve(file);
              })
              .catch((err) => {
                throw new BadRequestException(err);
              });
          }
        );
      });
      return File;
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }
  async getAllFL() {
    try {
      let data = await this.foodLoverModel
        .find({})
        .select(
          "-_id -__v -passHash -fcmRegistrationToken -customerCode -pinHash"
        )
        .lean();
    
      let rows = [];
      data.forEach((doc) => {
        rows.push(Object.values(doc));
      });
      let book = new Workbook();
      let sheet = book.addWorksheet(`sheet1`);
      rows.unshift(Object.keys(data[0]));
      sheet.addRows(rows);
      let File = await new Promise((resolve, reject) => {
        tmp.file(
          {
            discardDescriptor: true,
            prefix: `NoshifyTesterFL`,
            postfix: ".xlsx",
            mode: parseInt("0600", 8),
          },
          async (err, file) => {
            if (err) {
              throw new BadRequestException(err);
            }
            book.xlsx
              .writeFile(file)
              .then((_) => {
                resolve(file);
              })
              .catch((err) => {
                throw new BadRequestException(err);
              });
          }
        );
      });
      return File;
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }
}
