import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import * as admin from "firebase-admin";

// import { pad } from "./utils";
@Controller()
// @UseGuards(new JWTAuthGuard())
export class AppController {
  constructor(private readonly appService: AppService) {
    // static uniqueNumber='0000001'
  }
  @Get()
  async getHello() {

    return this.appService.getHello();
  }
  @Get("/getUniqueNumber")
  async getUniqueNumber() {
    let response = this.appService.getUniqueNumber();
    return response;
  }
}
