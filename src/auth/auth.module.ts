import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSchema } from './auth.model';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
  JwtModule.register({
    secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    signOptions: { expiresIn: '1h' },
  }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
