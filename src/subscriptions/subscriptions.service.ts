import { Model } from "mongoose";
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { FoodLover } from "../foodLover/foodLover.model";
import { FoodCreator } from "../food-creator/food-creator.model";
import { SUBSCRIPTION_MESSAGES } from "./constants/key-constants";


@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator") private readonly foodCreatorModel: Model<FoodCreator>
  ) {}
  private logger = new Logger("Profile");

  async subscribe(request) {
    let { user, body }: {
      user: { phoneNo: string, id: string };
      body: { foodCreatorId: string; };
    } = request;
    try {
      let fcProfile = await this.foodCreatorModel.findOne({
        _id: body.foodCreatorId,
      });
      if (!fcProfile) {
        throw SUBSCRIPTION_MESSAGES.USER_NOT_FOUND;
      }
      let flProfile = await this.foodLoverModel.findOne({
        _id: user.id,
      });

      if(flProfile.subscribedTo.includes(body.foodCreatorId)) {
        throw SUBSCRIPTION_MESSAGES.ALREADY_SUBSCRIBED_TO_FC;
      } else {
        let updatedSubscriptions = [...flProfile.subscribedTo, body.foodCreatorId]
        const result = await this.foodLoverModel.findOneAndUpdate(
          { _id: user.id },
          {
            $set: {
              subscribedTo: updatedSubscriptions,
            },
          },
          { new: true }
        );
        return { subscribedTo: result.subscribedTo};
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }

  async unsubscribe(request) {
    let { user, body }: {
      user: { phoneNo: string, id: string };
      body: { foodCreatorId: string; };
    } = request;
    try {
      let flProfile = await this.foodLoverModel.findOne({
        _id: user.id,
      });

      if(!flProfile.subscribedTo.includes(body.foodCreatorId)) {
        throw SUBSCRIPTION_MESSAGES.NOT_SUBSCRIBED_TO_FC;
      } else {
        let updatedSubscriptions = flProfile.subscribedTo.filter(subscription => {
          return !(subscription.equals(body.foodCreatorId))
        })
        const result = await this.foodLoverModel.findOneAndUpdate(
          { _id: user.id },
          {
            $set: {
              subscribedTo: updatedSubscriptions,
            },
          },
          { new: true }
        );
        return { subscribedTo: result.subscribedTo};
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }
}
