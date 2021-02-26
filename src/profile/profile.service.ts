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
import { FoodLover } from "../foodLover/foodLover.model";
import { FoodCreator } from "../food-creator/food-creator.model";
import { Orders } from "src/orders/orders.model";
const bcrypt = require("bcryptjs");

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("Orders") private readonly ordersModel:Model<Orders>
  ) {}
  private logger = new Logger("Profile");

  async updateProfile(request, query) {
    let pinHash: string;
    let {
      user,
      body,
    }: {
      user: { phoneNo: string };
      body: {
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
        creatorFoodType:Array<string>
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

        if (userProfile) {
          if (body.pin) {
            pinHash = bcrypt.hashSync(body.pin, 8);
          }
          const updatedProfile = await model.findOneAndUpdate(
            { phoneNo: user.phoneNo },
            {
              $set: {
                phoneNo: body.phoneNo || userProfile.phoneNo,
                verified: body.verified || userProfile.verified,
                email: body.email || userProfile.email,
                username: body.username || userProfile.username,
                imageUrl: body.imageUrl || userProfile.imageUrl,
                location: body.location || userProfile.location,
                pinHash: pinHash || userProfile.pinHash,
                mobileRegisteredId:
                  body.mobileRegisteredId || userProfile.mobileRegisteredId,
                ...(userType === "fl" && {
                  firstName: body.firstName || userProfile.firstName,
                  lastName:body.lastName||userProfile.lastName
                }),
                ...(userType === "fc" && {
                  businessName: body.businessName || userProfile.businessName,
                  creatorFoodType:body.creatorFoodType||userProfile.creatorFoodType
                }),
              },
            },
            { new: true, fields: { passHash: 0, __v: 0 } }
          ).lean();
          updatedProfile.pinHash = !!updatedProfile.pinHash;
      let totalOrders=await this.ordersModel.countDocuments({foodLoverId:userProfile._id,orderStatus:"Order Completed"})
          return {...updatedProfile,totalOrders};
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
    }: { user: { phoneNo: string }; body: { password: string } } = request;
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

        if (userProfile) {
          userProfile.passHash = bcrypt.hashSync(body.password, 8);
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
}
