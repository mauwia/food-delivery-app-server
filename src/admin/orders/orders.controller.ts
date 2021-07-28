import { Controller, Get, Param, Query } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly adminOrdersService: OrdersService) {}

  @Get('/:status')
  async getOrderByStatus (@Query() queryParams, @Param('status') status): Promise<any> {
    return await this.adminOrdersService.getOrdersByStatus(queryParams, status);
  }
}
