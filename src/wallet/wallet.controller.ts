import { Body, Controller,Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { string } from 'is_js';

import { WalletService } from './wallet.service';

@Controller('wallet')

export class WalletController {
    constructor(private readonly walletService: WalletService) {}
    @Get("/create")
    async CreateWallet(){
       let response=await this.walletService.createWallet()
       return response
    }
    @Get("/getBalance")
    async GetBalance(@Req() request:Request){
       let response=await this.walletService.getBalance(request.body.address)
       return response
    }
}
