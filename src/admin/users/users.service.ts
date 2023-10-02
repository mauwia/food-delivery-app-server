import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const bcrypt = require("bcryptjs");
import { AdminUser } from './admin-user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel("AdminUser") private readonly adminUser: Model<AdminUser>,
  ) {}

  async findByLogin({ email, password }) {
    const user = await this.adminUser.findOne({ email });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);    
    }

    // compare passwords    
    const areEqual = await bcrypt.compare(password, user.password);

    if (!areEqual) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);    
    }

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  async findByPayload({ id, email }) {
    return await this.adminUser.findOne({ _id: id, email });
  }
}
