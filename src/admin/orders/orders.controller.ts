import { Types } from 'mongoose';
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { JWTAuthGuard } from "src/foodLover/jwt/jwt-auth.guard";
import { AuthService } from 'src/admin/auth/auth.service';

@Controller()
export class OrdersController {
  constructor(
    private readonly adminAuthService: AuthService,
    private readonly adminOrdersService: OrdersService
  ) {}

  @Get('/:param')
  @UseGuards(new JWTAuthGuard())
  async getOrderByIdOrParam (@Query() queryParams, @Param('param') param, @Req() { user }): Promise<any> {
    await this.adminAuthService.validateUser(user);
    const validOrderStatus = [
      "New", "Accepted", "Being Prepared", "Prepared", "InTransit", "Decline", "Cancel", "Order Completed"
    ];
    
    if (Types.ObjectId.isValid(param)) {
      return await this.adminOrdersService.getOrder(param);
    } else if (validOrderStatus.includes(param)) {
      return await this.adminOrdersService.getOrdersByStatus(queryParams, param);   
    }
  }
}
