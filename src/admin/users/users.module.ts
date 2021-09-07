import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { AdminUserSchema } from './admin-user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AdminUser', schema: AdminUserSchema },
    ], 'noshify'),
  ],
  providers: [UsersService],
  exports: [UsersService],
})

export class UsersModule {}
