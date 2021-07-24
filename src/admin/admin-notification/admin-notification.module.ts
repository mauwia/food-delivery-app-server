import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { AdminNotificationService } from './admin-notification.service'
import { AdminNotificationSchema } from 'src/admin/admin-notification/admin-notifications.model'
import { AdminNotificationController } from './admin-notification.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "AdminNotification", schema: AdminNotificationSchema },
    ]),
  ],
  controllers: [AdminNotificationController],
  providers: [AdminNotificationService],
  exports: [AdminNotificationService],
})

export class AdminNotificationModule {}
