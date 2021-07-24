import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AdminNotificationService } from './admin-notification.service';
import { AdminNotification } from './admin-notifications.model';

@Controller()
export class AdminNotificationController {
  constructor(private readonly notificationService: AdminNotificationService) {}

  @Get()
  async getAllNotification (@Query() queryParams): Promise<any> {
    return await this.notificationService.getAllNotification(queryParams);
  }

  @Patch('/:id')
  async updateNotification (@Param('id') id): Promise<AdminNotification> {
    return await this.notificationService.updateNotification(id);
  }

  @Get('/:id')
  async getNotification (@Param('id') id): Promise<AdminNotification> {
    return await this.notificationService.getNotification(id);
  }
}
