import { Model } from "mongoose";
import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FoodLover } from "../foodLover/foodLover.model";
import { FoodCreator } from "../food-creator/food-creator.model";
import { SUBSCRIPTION_MESSAGES } from "./constants/key-constants";
import * as admin from "firebase-admin";
import { NotificationService } from "src/notification/notification.service";
import {SubscriptionGateway} from "./subscription.gateway"
@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel("FoodLover") private readonly foodLoverModel: Model<FoodLover>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    private readonly notificationService:NotificationService,
    private readonly subscriptionGateway:SubscriptionGateway
  ) {}
  private logger = new Logger("Profile");

  async subscribe(request) {
    let {
      user,
      body,
    }: {
      user: { phoneNo: string; id: string };
      body: { foodCreatorId: string,timestamp:any };
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

      if (flProfile.subscribedTo.includes(body.foodCreatorId)) {
        throw SUBSCRIPTION_MESSAGES.ALREADY_SUBSCRIBED_TO_FC;
      } else {
        let notification=  await this.notificationService.createNotification({
          notificationType:"Subscribe",
          senderId: flProfile._id,
          onSenderModel: "FoodLover",
          receiverId: fcProfile._id,
          onReceiverModel: "FoodCreator",
          createdAt:body.timestamp,
          updatedAt:body.timestamp
        })
        const session = await this.foodLoverModel.startSession();
        session.startTransaction();
        try {
          let flUpdatedSubscriptions = [
            ...flProfile.subscribedTo,
            body.foodCreatorId,
          ];
          let fcUpdatedSubcribers = [...fcProfile.subscribers, user.id];
          await this.foodCreatorModel.findOneAndUpdate(
            { _id: body.foodCreatorId },
            {
              $set: {
                subscribers: fcUpdatedSubcribers,
              },
            }
          );
          const result = await this.foodLoverModel.findOneAndUpdate(
            { _id: user.id },
            {
              $set: {
                subscribedTo: flUpdatedSubscriptions,
              },
            },
            { new: true }
          );
          await session.commitTransaction();
          await this.subscriptionGateway.handleSubscription(fcProfile.phoneNo,fcProfile.fcmRegistrationToken,`You've got a new subscriber!${flProfile.username} `)
          
          return { subscribedTo: result.subscribedTo };
          
        } catch (error) {
          await session.abortTransaction();
          this.logger.error("Subscription operation arboted");
          this.logger.error(error);
        } finally {
          session.endSession();
        }
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }

  async unsubscribe(request) {
    let {
      user,
      body,
    }: {
      user: { phoneNo: string; id: string };
      body: { foodCreatorId: string,timestamp:any };
    } = request;
    try {
      let flProfile = await this.foodLoverModel.findOne({
        _id: user.id,
      });
      let fcProfile = await this.foodCreatorModel.findOne({
        _id: body.foodCreatorId,
      });

      if (!flProfile.subscribedTo.includes(body.foodCreatorId)) {
        throw SUBSCRIPTION_MESSAGES.NOT_SUBSCRIBED_TO_FC;
      } else {
        let notification=  await this.notificationService.createNotification({
          notificationType:"Unsubscribe",
          senderId: flProfile._id,
          onSenderModel: "FoodLover",
          receiverId: fcProfile._id,
          onReceiverModel: "FoodCreator",
          createdAt:body.timestamp,
          updatedAt:body.timestamp
        })
        const session = await this.foodLoverModel.startSession();
        session.startTransaction();
        try {
          let flUpdatedSubscriptions = flProfile.subscribedTo.filter(
            (subscription) => {
              return !subscription.equals(body.foodCreatorId);
            }
          );
          let fcUpdatedSubcribers = fcProfile.subscribers.filter(
            (subscription) => {
              return !subscription.equals(user.id);
            }
          );

          await this.foodCreatorModel.findOneAndUpdate(
            { _id: body.foodCreatorId },
            {
              $set: {
                subscribers: fcUpdatedSubcribers,
              },
            }
          );
          const result = await this.foodLoverModel.findOneAndUpdate(
            { _id: user.id },
            {
              $set: {
                subscribedTo: flUpdatedSubscriptions,
              },
            },
            { new: true }
          );
          await session.commitTransaction();
          await this.subscriptionGateway.handleSubscription(fcProfile.phoneNo,fcProfile.fcmRegistrationToken,`${flProfile.username} unsubscribed you`)

          return { subscribedTo: result.subscribedTo };
        } catch (error) {
          await session.abortTransaction();
          this.logger.error("Unsubscribe operation arboted");
          this.logger.error(error);
        } finally {
          session.endSession();
        }
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }

  async getFcSubscriptions(request, foodCreatorID) {
    let {
      user,
    }: {
      user: { phoneNo: string; id: string };
    } = request;

    try {
      let fcProfile = await this.foodCreatorModel.findOne({
        _id: foodCreatorID,
      });
      if (!fcProfile) {
        throw SUBSCRIPTION_MESSAGES.USER_NOT_FOUND;
      } else {
        return this.foodCreatorModel
          .findOne({ _id: foodCreatorID }, { subscribers: 1 })
          .populate("subscribers", { username: 1, imageUrl: 1 })
          .exec();
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }
  async getFlSubscription(request,foodLoverID){
    let {
      user,
    }: {
      user: { phoneNo: string; id: string };
    } = request;
    try{
      let flProfile = await this.foodLoverModel.findOne({
        _id: foodLoverID,
      });
      if (!flProfile) {
        throw SUBSCRIPTION_MESSAGES.USER_NOT_FOUND;
      } else {
        return this.foodLoverModel
          .findOne({ _id: foodLoverID }, { subscribedTo: 1 })
          .populate("subscribedTo", { username: 1, imageUrl: 1 })
          .exec();
      }
    }
    catch(error){
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }
  async isFlSubscribedToFC(request, foodCreatorID) {
    let {
      user,
    }: {
      user: { phoneNo: string; id: string };
    } = request;

    try {
      const fcSubscriptions = await this.getFcSubscriptions(
        request,
        foodCreatorID
      );
      let flIsSubscribedToFC = {}
      console.log(fcSubscriptions)
      if (fcSubscriptions.subscribers.length) {
        flIsSubscribedToFC = fcSubscriptions.subscribers.filter(
          (subscriber) => subscriber._id.equals(user.id)
        )[0];
      }else{
        return {
          isSubscribedToFC: false,
        };
      }
      if (!flIsSubscribedToFC) {
        return {
          isSubscribedToFC: false,
        };
      } else {
        return {
          isSubscribedToFC: true,
          flInfo: flIsSubscribedToFC,
        };
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(error);
    }
  }
}
