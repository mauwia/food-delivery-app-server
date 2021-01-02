import { Controller, Get, Post, Req,UseGuards } from "@nestjs/common";
import { request, Request } from "express";
import { JWTAuthGuard } from "../foodLover/jwt/jwt-auth.guard";
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
  @Get('/checkTransaction')
  async CheckTransaction(@Req() request:Request){
    let response = await this.walletService.checkTransaction(request.body);
    return response;
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/sendNoshies")
  async SendNoshies(@Req()req:Request){
    let response = await this.walletService.sendNoshies(req)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Post("/withdrawNoshies")
  async WithdrawNoshies(@Req()req:Request){
    let response = await this.walletService.withdrawNoshies(req)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Post('/getNoshifyContacts')
  async GetNoshifyContacts(@Req() req:Request){
    let response=await this.walletService.getNoshifyContacts(req)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Post('/addNoshiesByCard')
  async AddNoshiesByCard(@Req() req:Request){
    let response=await this.walletService.addNoshiesByCard(req,"By_Card")
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Post('/addNoshiesByBank')
  async AddNoshiesByBank(@Req() req:Request){
    ///Will update when paystack integrate
    let response=await this.walletService.addNoshiesByCard(req,"By_Bank")
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Get('/getAllAssets')
  async GetAllAssets(@Req() req:Request){
    ///Will update when paystack integrate
    let response=await this.walletService.getAllAssets(req)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Get('/getAllTransactions')
  async GetAllTransactions(@Req() req:Request){
    let response=await this.walletService.getTransactions(req)
    return response
  }
  @UseGuards(new JWTAuthGuard())
  @Get('/getTransactionsByAsset/:assetId')
  async GetAllTransactionsByAssets(@Req() req:Request){
    let response=await this.walletService.getTransactions(req)
    return response
  }
}
