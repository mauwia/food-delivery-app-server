import { MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from "socket.io";
import { AdminNotificationService } from "src/admin/admin-notification/admin-notification.service";

@WebSocketGateway({ transports: ['websocket']})
export class AdminGateway {
  @WebSocketServer() server: Server;
  constructor(
    private readonly adminNotificationService: AdminNotificationService,
  ){}

  handleFCSignup(@MessageBody() payload: unknown ) {
    this.server.emit('fcSignupToClient', payload)
  }

  handleNewOrder(@MessageBody() payload: unknown ) {
    this.server.emit('newOrderToClient', payload)
  }

  handleNewChat(@MessageBody() payload: unknown) {
    this.server.emit('newChatFromServer', payload)
  }

  handleAdminNotification(@MessageBody() payload: unknown) {
    this.server.emit('newNotification', payload)
  }

  handleOrderStatusUpdate(@MessageBody() payload: unknown) {
    this.server.emit('updatedOrderStatus', payload)
  }

  async sendNewFCEmailNoticeToAdmin(user) {
    this.adminNotificationService.sendNewFCSignupEmail(user);
  }

  async sendWelcomeEmail(profile, templateId, userType) {
    try {
      await this.adminNotificationService.sendWelcomeEmail(profile.email, templateId);
    } catch (error) {
      const notification = await this.adminNotificationService.saveNotification({
        type: 'emailError',
        subjectId: profile._id,
        subjectName: profile.email,
        additionalInfo: { emailType: 'Welcome Email', userType },
      });
      this.server.emit('welcomeEmailError', { notification, error: { ...error, updatedAt: Date.now()} });
    }
  }
}
