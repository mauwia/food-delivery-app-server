import { Controller, Delete, Get, Post, Put, Req,UseGuards } from "@nestjs/common";
import { request, Request } from "express";
import { JWTAuthGuard } from "../foodLover/jwt/jwt-auth.guard";
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService:MenuService){}
    @UseGuards(new JWTAuthGuard())
    @Post('/addMenu')
    async AddMenu(@Req() request:Request){
        let response=await this.menuService.addMenu(request)
        return response
    }
    @UseGuards(new JWTAuthGuard())
    @Post("/addMenuItem")
    async AddMenuItem(@Req() request:Request){
        let response=await  this.menuService.addMenuItem(request)
        return response
    }
    @UseGuards(new JWTAuthGuard())
    @Delete('/deleteMenu')
    async DeleteMenu(@Req() request:Request){
        let response=await this.menuService.deleteMenu(request)
        return response
    }
    @UseGuards(new JWTAuthGuard())
    @Put('/editMenuItem')
    async EditMenuItem(@Req() request:Request){
        let response=await this.menuService.editMenuItem(request)
        return response
    }
    @UseGuards(new JWTAuthGuard())
    @Get('/getMenu/:creatorID')
    async getMenuWithCreatorID(@Req() request:Request){
        let response=await this.menuService.getMenuWithCreatorId(request)
        return response
    }
    // @UseGuards(new JWTAuthGuard())
    // @Get("/getAllCreators")
    // async GetAllCreators(@Req() request:Request){
    //     let response=await this.menuService.getAllCreators(request)
    //     return response
    // }

}
