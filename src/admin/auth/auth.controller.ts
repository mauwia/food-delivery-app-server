import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly adminAuthService: AuthService) {}

  @Post('/login')
  async loginUser (@Body() userLoginData): Promise<any> {
    return await this.adminAuthService.login(userLoginData);
  }
}
