import { Controller, Post, Req } from '@nestjs/common';
import { request, Request } from "express";
import { EarlyRegisterationService } from './early-registeration.service';

@Controller('early-registeration')
export class EarlyRegisterationController {
    constructor(
        private readonly EarlyRegisterationService:EarlyRegisterationService
    ){}
    @Post("/requestEarlyAccess")
    async EarlyAccess(@Req() request:Request){
        
    }
}
