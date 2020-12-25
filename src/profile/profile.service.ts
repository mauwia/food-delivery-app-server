import { Model } from 'mongoose';
import { Injectable, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PROFILE_MESSAGES } from './constants/key-constants';
import { FoodLover } from '../foodLover/foodLover.model';
const bcrypt = require('bcryptjs');


@Injectable()
export class ProfileService {
  constructor (
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>
  ) {}
  private logger = new Logger('Profile');

  async updateProfile(request) {
    let pinHash: string;
    let { user, body }: { user: {phoneNo: string}, body: {
      phoneNo: string,
      verified: boolean,
      username: string,
      imageUrl: string,
      location: [],
      mobileRegisteredId: string,
      pin: string,
    } } = request;

    try {
      if (body.phoneNo) {
        const numberExists = await this.foodLoverModel.findOne({
          phoneNo: body.phoneNo,
        });
        if (numberExists) {
          throw PROFILE_MESSAGES.NUMBER_IN_USE;
        }
      }

      const userProfile = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });

      if(userProfile) {
        if (body.pin) {
          pinHash = bcrypt.hashSync(body.pin, 8);
        }
        const updatedProfile = await this.foodLoverModel.findOneAndUpdate(
          { phoneNo: user.phoneNo },
          { $set: {
            phoneNo: body.phoneNo || userProfile.phoneNo,
            verified: body.verified || userProfile.verified,
            username: body.username || userProfile.username,
            imageUrl: body.imageUrl || userProfile.imageUrl,
            location: body.location || userProfile.location,
            pinHash: pinHash || userProfile.pinHash,
            mobileRegisteredId: body.mobileRegisteredId || userProfile.mobileRegisteredId,
          }},
          { new: true,
            fields: { passHash: 0, __v: 0 }
          },
        );
        updatedProfile.pinHash = !!updatedProfile.pinHash
        return updatedProfile;
      } else {
        throw PROFILE_MESSAGES.USER_NOT_FOUND
      }
    } catch (error) {
      this.logger.error(error, error.stack)
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          msg: error,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updatePassword(request) {
    let { user, body }: { user: { phoneNo: string }, body: {
      password: string,
    } } = request;
    let passwordHash = bcrypt.hashSync(body.password, 8)

    try {
      const userProfile = await this.foodLoverModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (userProfile) {
        userProfile.passHash = bcrypt.hashSync(body.password, 8);
        await userProfile.save();
        return { passwordUpdated: true };
      } else {
        throw PROFILE_MESSAGES.USER_NOT_FOUND
      }
    } catch (error) {
      this.logger.error(error, error.stack)
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
