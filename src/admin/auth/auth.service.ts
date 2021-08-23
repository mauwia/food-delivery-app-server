import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminUsersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser (payload) {
    const user = await this.adminUsersService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);    
    }    
    return user; 
  }

  async login (userLoginData) {
    // find user in db    
    const user = await this.adminUsersService.findByLogin(userLoginData);
    const token = this._createToken(user);
    
    return { token };  
  }

  private _createToken({ id, firstName, lastName, email, role }): any {
    const user: JwtPayload = { id, firstName, lastName, email, role };    
    const accessToken = this.jwtService.sign(user);  
  
    return accessToken; 
  }
}
