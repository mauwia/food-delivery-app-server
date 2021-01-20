import { Model } from 'mongoose';
import { Injectable, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PROFILE_MESSAGES, PROFILE_DATA } from './constants/key-constants';
import { FoodLover } from '../foodLover/foodLover.model';
import { FoodCreator } from '../food-creator/food-creator.model';
const bcrypt = require('bcryptjs');


@Injectable()
export class ProfileService {
  constructor (
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator") private readonly foodCreatorModel: Model<FoodCreator>
  ) {}
  private logger = new Logger('Profile');

  async updateProfile(request, response, query) {
    let pinHash: string;
    let { user, body }: { user: {phoneNo: string}, body: {
      phoneNo: string,
      verified: boolean,
      username: string,
      businessName: string,
      imageUrl: string,
      location: [],
      mobileRegisteredId: string,
      pin: string,
    } } = request;
    let userType = query.user as string;

    if (this.isValidUsertype(query, response)) {
      let model;
      if (userType === 'fl') {
        model = this.foodLoverModel;
      } else {
        model = this.foodCreatorModel;
      }

      try {
        if (body.phoneNo) {
          const numberExists = await model.findOne({
            phoneNo: body.phoneNo,
          });
          if (numberExists) {
            throw PROFILE_MESSAGES.NUMBER_IN_USE;
          }
        }
        console.log(model)
        const userProfile = await model.findOne({
          phoneNo: user.phoneNo,
        });
  
        if(userProfile) {
          if (body.pin) {
            pinHash = bcrypt.hashSync(body.pin, 8);
          }
          const updatedProfile = await model.findOneAndUpdate(
            { phoneNo: user.phoneNo },
            { $set: {
              phoneNo: body.phoneNo || userProfile.phoneNo,
              verified: body.verified || userProfile.verified,
              username: body.username || userProfile.username,
              imageUrl: body.imageUrl || userProfile.imageUrl,
              location: body.location || userProfile.location,
              pinHash: pinHash || userProfile.pinHash,
              mobileRegisteredId: body.mobileRegisteredId || userProfile.mobileRegisteredId,
              ...(userType === 'fl' && { username: body.username || userProfile.username }),
              ...(userType === 'fc' && { businessName: body.businessName || userProfile.businessName })
            }},
            { new: true,
              fields: { passHash: 0, __v: 0 }
            },
          );
          updatedProfile.pinHash = !!updatedProfile.pinHash
          console.log(updatedProfile)
          return response.status(200).json({
            updatedProfile
          });
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

  async updatePassword(request, response, query) {
    let { user, body }: { user: { phoneNo: string }, body: { password: string } } = request;
    let userType = query.user as string;

    if (this.isValidUsertype(query, response)) {
      try {
        let model;
        if (userType === 'fl') {
          model = this.foodLoverModel;
        } else {
          model = this.foodCreatorModel;
        }
        
        let userProfile = await model.findOne({
          phoneNo: user.phoneNo,
        });``

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

  isValidUsertype(query, response) {
    let userType = query.user as string;

    if (!userType) {
      return response.status(400).json({
        msg: PROFILE_MESSAGES.SPECIFY_USER_TYPE
      });
    }

    if (!PROFILE_DATA.USER_TYPES.includes(`${userType}`)) {
      return response.status(400).json({
        msg: PROFILE_MESSAGES.INVALID_USER_TYPE
      });
    }

    return true;
  }
}
