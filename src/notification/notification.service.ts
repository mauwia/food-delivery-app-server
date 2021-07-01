import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Notification} from './notification.model'

@Injectable()
export class NotificationService {
    constructor(@InjectModel("Notification") private readonly notificationModel:Model<Notification>){}
    async createNotification(body){
       let newNotification=new this.notificationModel(body)
       return await this.notificationModel.create(newNotification)
    }
}
