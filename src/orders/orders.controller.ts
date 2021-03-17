import { Controller, Get, Post, Put, Req, UseGuards } from "@nestjs/common";
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
  @Post("/checkPromo")
  async CheckPromo(@Req() request: Request) {
    let response = this.ordersService.checkPromo(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Get("/getOrders")
  async GetOrders(@Req() request: Request) {
    let response = this.ordersService.getOrders(request);
    return response;
  }

  @UseGuards(new JWTAuthGuard())
  @Get("/getOrdersHistory/:page")
  async GetOrdersHistory(@Req() request: Request) {
    let response = this.ordersService.getOrderHistory(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Put("/updateOrderStatus")
  async UpdateOrderStatus(@Req() request: Request) {
    let response = this.ordersService.updateOrderStatus(request);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/addRating")
  async AddRating(@Req() request: Request){
    let response=this.ordersService.addRating(request)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Get("/getReviews/:foodCreatorId")
  async GetReviews(@Req() request: Request){
    let response=this.ordersService.getReviews(request)
    return response
  }
}
