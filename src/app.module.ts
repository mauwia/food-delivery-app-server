import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
// import {TwilioModule} from 'nestjs-twilio'
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";


@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot( `mongodb+srv://${process.env.MONGOOSE_PASSWORD}:nestonep@cluster0.arej3.mongodb.net/${process.env.MONGOOSE_DB_NAME}?retryWrites=true&w=majority`,{
      useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true
    }),
    // TwilioModule.forRoot({
    //   accountSid:process.env.TWILIO_ACCOUNT_SID,
    //   authToken:process.env.TWILIO_AUTH_TOKEN,
    // })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
