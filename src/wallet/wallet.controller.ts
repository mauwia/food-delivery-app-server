import { Controller, Get, Post, Req,UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JWTAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { WalletService } from "./wallet.service";

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Get("/create")
  async CreateWallet() {
    let response = await this.walletService.createWallet();
    return response;
  }
  @Get("/getBalance")
  async GetBalance(@Req() request: Request) {
    let response = await this.walletService.getBalance(request.body.address);
    return response;
  }
  @Post("/sendNoshies")
  async SendNoshies(@Req()req:Request){
    let response = await this.walletService.sendNoshies(req)
  }
  @UseGuards(new JWTAuthGuard())
  @Get('/getNoshifyContacts')
  async GetNoshifyContacts(@Req() req:Request){
    let response=await this.walletService.getNoshifyContacts(req)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Post('/addNoshiesByCard')
  async AddNoshiesByCard(@Req() req:Request){
    let response=await this.walletService.addNoshiesByCard(req)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Post('/addNoshiesByBank')
  async AddNoshiesByBank(@Req() req:Request){
    ///Will update when paystack integrate
    let response=await this.walletService.addNoshiesByCard(req)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Get('/getAllAssets')
  async GetAllAssets(@Req() req:Request){
    ///Will update when paystack integrate
    let response=await this.walletService.getAllAssets(req)
    return response
  }
}
