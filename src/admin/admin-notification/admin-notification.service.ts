// import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, ObjectId } from 'mongoose';
import { AdminNotification } from './admin-notifications.model';
import { 
  getPaginationOptions,
  GetAllRequestParams,
  getPaginatedResult,
  Paginated } from '../shared/pagination';


@Injectable()
export class AdminNotificationService {
  constructor(
    @InjectModel('AdminNotification') private readonly  notificationModel:PaginateModel<AdminNotification>,
  ) {}

  async saveNotification(type, resource) {
    const payload = {
      type,
      subjectId: resource._id,
      subjectName: resource.businessName,
      subjectImgUrl: resource.imageUrl,
    }

    const newNotification = new this.notificationModel(payload);
    const notification = await this.notificationModel.create(newNotification);
    return notification;
  };

  async updateNotification(id) {
    const updatedNotification = await this.notificationModel.findOneAndUpdate(
      { _id: id },
      { $set: { viewed: true }},
      { new: true }
    );
    return updatedNotification;
  };

  async getNotification(id: ObjectId): Promise<AdminNotification> {
    const result = await this.notificationModel.findById(id);
    return result;
  }

  async getAllNotification(queryParams: GetAllRequestParams) {
    let query = {};
    const options = getPaginationOptions(queryParams);

    if (queryParams.search) {
      query = {
        $or: [          
          { title: new RegExp(queryParams.search, 'i') },
          { subjectName: new RegExp(queryParams.search, 'i') },
        ],
      };
    }

    const result = await this.notificationModel.paginate(query, options);
    return getPaginatedResult(result);
  }
}
