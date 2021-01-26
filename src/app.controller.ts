import {
  Controller,
  Get,
} from "@nestjs/common";
import { AppService } from "./app.service";
// import { pad } from "./utils";
@Controller()
// @UseGuards(new JWTAuthGuard())
export class AppController {
  constructor(private readonly appService: AppService) {
    // static uniqueNumber='0000001'
  }
  @Get()
  getHello() {
    return this.appService.getHello();
  }
  @Get('/getUniqueNumber')
  async getUniqueNumber(){
    let response=this.appService.getUniqueNumber()
    return response
  }


 
 
}
