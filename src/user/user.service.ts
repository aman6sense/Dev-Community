import {
  Injectable
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUserDto';
import { updateUserDto } from './dto/updateUserDto';
import { User, UserDocument } from './schema/user.schema';

import { UserType } from './model/user.userType.enum';






@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<any> {


    
    const newUser = {
      name: createUserDto.name ? createUserDto.name : "",
      email: createUserDto.email ? createUserDto.email : "",
      password: createUserDto.password ? createUserDto.password : "",
      userType: createUserDto.userType ? createUserDto.userType : UserType.BACKEND,
    };

    const user = await this.userModel.create(newUser);

    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
  }

  async findAll(): Promise<UserDocument[]> {
    return await this.userModel.find();
  }

  async findById(id: any): Promise<UserDocument> {
    return await this.userModel.findById(id);
  }

  async findByUsername(username: string): Promise<UserDocument> {
    return await this.userModel.findOne({ username });
  }
  async findByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email });
  }

  async update(
    id: string,
    updateUserDto: updateUserDto,
  ): Promise<UserDocument> {
    return await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      ;
  }
  async updateRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<UserDocument> {
    return await this.userModel
      .findByIdAndUpdate(id, { refreshToken }, { new: true })
      ;
  }

  async remove(id: string): Promise<UserDocument> {
    return await this.userModel.findByIdAndDelete(id);
  }
}
