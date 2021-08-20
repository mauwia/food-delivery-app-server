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
import { isProduction } from 'src/admin/shared/utils';
import { getMessage, sendEmail as sendAdminNotificationEmail } from 'src/admin/shared/emailNotification';


@Injectable()
export class AdminNotificationService {
  constructor(
    @InjectModel('AdminNotification') private readonly  notificationModel:PaginateModel<AdminNotification>,
  ) {}

  async saveNotification({type, subjectId, subjectName, additionalInfo = {}, img = ''}) {
    const payload = {
      type,
      subjectId,
      subjectName,
      subjectImgUrl: img,
      additionalInfo,
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

  async sendNewFCSignupEmail (user) {
    if (isProduction()) {
      process.env.ADMIN_EMAILS.split(" ").forEach(adminEmail => {
        const message = getMessage({
          sender: {
            name: 'Noshify',
            email: process.env.SENDER_EMAIL,
          },
          recepient: adminEmail,
          subject: 'New FC Signup',
          phone: `${user.countryCode}${user.phoneNo}`,
          profileUrl: `${process.env.ADMIN_PORTAL_ROOT_URL}/admin/creators/${user._id}`
        });
        sendAdminNotificationEmail(message);
      });
    }
  }

  async sendFCVerificationStatusEmail(email, templateId) {
    const message = {
      from: {
        name: 'Noshify',
        email: process.env.SENDER_EMAIL,
      },
      to: email,
      "template_id": templateId,
    }
    sendAdminNotificationEmail(message);
  }
}
