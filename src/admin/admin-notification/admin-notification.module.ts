import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { AdminNotificationService } from './admin-notification.service'
import { AdminNotificationSchema } from 'src/admin/admin-notification/admin-notifications.model'
import { AdminNotificationController } from './admin-notification.controller';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "AdminNotification", schema: AdminNotificationSchema },
    ], 'noshify'),
    AuthModule,
  ],
  controllers: [AdminNotificationController],
  providers: [AdminNotificationService],
  exports: [AdminNotificationService],
})

export class AdminNotificationModule {}
