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

  async saveNotification(type, id, subject, img = '') {
    const payload = {
      type,
      subjectId: id,
      subjectName: subject,
      subjectImgUrl: img,
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

    let unreadCount = () => {
      return [
        {
          $match: {
            viewed: false 
          },
        },
        { $count: "unreadCount" },
      ];
    };

    const unread = await this.notificationModel.aggregate(unreadCount());
    const count = unread.length > 0 ? unread[0].unreadCount : 0;

    const result = await this.notificationModel.paginate(query, options);
    const paginatedResult = getPaginatedResult(result);
  
    return {...paginatedResult, unreadNotification: count }
  }
}
