import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TwilioModule } from "nestjs-twilio";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FoodLoverModule } from "./foodLover/foodLover.module";
import { WalletModule } from "./wallet/wallet.module";
import { ProfileModule } from "./profile/profile.module";
import { FoodCreatorModule } from "./food-creator/food-creator.module";
import { OrdersModule } from "./orders/orders.module";
import { MenuModule } from "./menu/menu.module";
import { ChatModule } from "./chat/chat.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { ReviewModule } from './review/review.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationModule } from './notification/notification.module';
import { AdminModule } from './admin/admin.module';
import { RouterModule } from 'nest-router';
import routes from './admin/routes';
import { FoodLoverSchema } from "./foodLover/foodLover.model";
import { FoodCreatorSchema } from "./food-creator/food-creator.model";

@Module({
  imports: [
    FoodLoverModule,
    MongooseModule.forRoot( `${process.env.MONGO_URI}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        connectionName: 'noshify',
      }
    ),
    MongooseModule.forRoot( `${process.env.LANDING_PAGE_MONGO_URI}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        connectionName: 'landingPage',
      }
    ),
    MongooseModule.forFeature([
      { name: "FoodLover", schema: FoodLoverSchema },
      { name: "FoodCreator", schema: FoodCreatorSchema },
    ], 'noshify'),
    // MorganModule.forRoot(),
    ProfileModule,
    WalletModule,
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
    FoodCreatorModule,
    OrdersModule,
    MenuModule,
    ChatModule,
    SubscriptionsModule,
    ReviewModule,
    AnalyticsModule,
    AdminModule,
    RouterModule.forRoutes(routes), // setup the admin routes
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
