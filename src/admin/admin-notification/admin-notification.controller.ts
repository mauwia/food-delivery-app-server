import { Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AdminNotificationService } from './admin-notification.service';
import { AdminNotification } from './admin-notifications.model';
import { JWTAuthGuard } from "src/foodLover/jwt/jwt-auth.guard";
import { AuthService } from 'src/admin/auth/auth.service';

@Controller()
export class AdminNotificationController {
  constructor(
    private readonly adminAuthService: AuthService,
    private readonly notificationService: AdminNotificationService
  ) {}

  @Get()
  @UseGuards(new JWTAuthGuard())
  async getAllNotification (@Query() queryParams, @Req() { user }): Promise<any> {
    await this.adminAuthService.validateUser(user);
    return await this.notificationService.getAllNotification(queryParams);
  }

  @Patch('/:id')
  @UseGuards(new JWTAuthGuard())
  async updateNotification (@Param('id') id, @Req() { user }): Promise<AdminNotification> {
    await this.adminAuthService.validateUser(user);
    return await this.notificationService.updateNotification(id);
  }

  @Get('/:id')
  @UseGuards(new JWTAuthGuard())
  async getNotification (@Param('id') id, @Req() { user }): Promise<AdminNotification> {
    await this.adminAuthService.validateUser(user);
    return await this.notificationService.getNotification(id);
  }
}
