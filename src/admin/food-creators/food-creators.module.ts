import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodCreatorsController } from './food-creators.controller';
import { FoodCreatorsService } from './food-creators.service';
import { FoodCreatorSchema } from '../../food-creator/food-creator.model';
import { VerificationDetailSchema } from './verification-detail.model';
import { AuthModule } from '../auth/auth.module';
import { MenuSchema } from '../../menu/menu.model';
import { AdminNotificationModule } from "src/admin/admin-notification/admin-notification.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FoodCreator', schema: FoodCreatorSchema },
      { name: 'VerificationDetail', schema: VerificationDetailSchema },
      { name: 'Menu', schema: MenuSchema },
    ], 'noshify'),
    AuthModule,
    AdminNotificationModule,
  ],
  controllers: [FoodCreatorsController],
  providers: [FoodCreatorsService]
})
export class FoodCreatorsModule {}
