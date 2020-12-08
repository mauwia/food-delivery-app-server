import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSchema } from './auth.model';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtStrategy } from './jwt/jwt.strategy';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
  JwtModule.register({
    secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    signOptions: { expiresIn: '1h' },
  }),WalletModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
