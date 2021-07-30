import { Types } from 'mongoose';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly adminOrdersService: OrdersService) {}

  @Get('/:param')
  async getOrderByIdOrParam (@Query() queryParams, @Param('param') param): Promise<any> {
    console.log('here');
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
