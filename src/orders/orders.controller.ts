import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { request, Request } from "express";
import { JWTAuthGuard } from "../foodLover/jwt/jwt-auth.guard";
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @UseGuards(new JWTAuthGuard())
  @Post("/createOrder")
  async CreateOrder(@Req() request: Request) {
    let response = this.ordersService.createOrder(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post('/checkPromo')
  async CheckPromo(@Req() request:Request){
    let response = this.ordersService.checkPromo(request);
    return response;
  }
}
