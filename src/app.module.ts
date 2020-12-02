import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot( `mongodb+srv://${process.env.MONGOOSE_PASSWORD}:nestonep@cluster0.arej3.mongodb.net/${process.env.MONGOOSE_DB_NAME}?retryWrites=true&w=majority`,{
      useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
