import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminNotificationService } from './admin-notification.service';
import { AdminNotification } from './admin-notifications.model';

@Controller()
export class AdminNotificationController {
  constructor(private readonly notificationService: AdminNotificationService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllNotification (@Query() queryParams): Promise<any> {
    return await this.notificationService.getAllNotification(queryParams);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateNotification (@Param('id') id): Promise<AdminNotification> {
    return await this.notificationService.updateNotification(id);
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  async getNotification (@Param('id') id): Promise<AdminNotification> {
    return await this.notificationService.getNotification(id);
  }
}
