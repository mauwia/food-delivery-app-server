import { Module } from '@nestjs/common';
import { LandingPageController } from './landing-page.controller';
import { LandingPageService } from './landing-page.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    AuthModule,
  ],
  controllers: [LandingPageController],
  providers: [LandingPageService]
})
export class LandingPageModule {}
