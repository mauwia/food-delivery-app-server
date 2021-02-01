import {
  Controller,
  Get,
} from "@nestjs/common";
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
    await admin
          .messaging()
          .sendToDevice("emnzGg1nTkGtKYleZW5y7K:APA91bHv9cbFfmJ3zNTolNW2m9vs91JPwgFegjHRHu4pzWxN6u6cdTgLJlxXSUFAd8hn5TgOvO5L82OLJ6-1Kl3qU9DrZUv1vw8qfgJkSjTgHCRzT6EiRIUR19P-25mqldegZoS9AdkB", {
            notification: {
              title: `Order`,
              body: "Tap to view details",
            },
          });
    return this.appService.getHello();
  }
  @Get('/getUniqueNumber')
  async getUniqueNumber(){
    let response=this.appService.getUniqueNumber()
    return response
  }


 
 
}
