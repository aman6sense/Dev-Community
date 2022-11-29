import {
  Injectable, Logger, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUserDto';
import { UpdateUserDto } from './dto/updateUserDto';
import { User, UserDocument } from './schema/user.schema';

// import { ElasticSearchHelper, IndexNames } from '../helper/elastic.search.helper';
import { ElasticSearchHelper, IndexNames } from '../helper/elastic.search.helper';
import { SearchUserDto } from './dto/searchUserDto';
import { UserType } from './model/user.userType.enum';






@Injectable()
export class UserService {
  private logger = new Logger("userService");
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const user = await this.createNewUser(createUserDto);
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  async createNewUser(createUserDto: CreateUserDto) {
    const userData = this.createUserDtoImpl(createUserDto);
    return await this.userModel.create(userData);
  }

  createUserDtoImpl(createUserDto: CreateUserDto): {
    name: string;
    email: string,
    password: string,
    userType: UserType
  } {
    return {
      name: createUserDto.name ? createUserDto.name : "",
      email: createUserDto.email ? createUserDto.email : "",
      password: createUserDto.password ? createUserDto.password : "",
      userType: createUserDto.userType
        ? createUserDto.userType
        : UserType.BACKEND,

    }
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
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const existUser = await this.findById(userId);
    if (!existUser) {
      throw new NotFoundException("User is not valid")
    }
    const resUser = await this.updateExistingUser(userId, updateUserDto)

    // update user into ElasticSearch
    // if (resUser) {
    //   const userObj = resUser.toObject();
    //   const res = await ElasticSearchHelper.index(IndexNames.users, userObj);

    //   if (!res) {
    //     this.logger.log("user are not update on ElasticSearch")
    //   }
    //   else {
    //     // this.logger.log("update res: ", res)
    //   }
    // }
    return resUser;

  }



  async updateExistingUser(userId: string, updateUserDto: UpdateUserDto) {
    const userData = this.updateUserDtoImpl(updateUserDto);
    return await this.userModel
      .findByIdAndUpdate(new mongoose.Types.ObjectId(userId), userData, { new: true })
      ;
  }

  updateUserDtoImpl(updateUserDto: UpdateUserDto): {
    name: string;
    userType: UserType
  } {
    return {
      name: updateUserDto.name ? updateUserDto.name : "",
      userType: updateUserDto.userType
        ? updateUserDto.userType
        : UserType.BACKEND,

    }
  }



  async remove(id: string): Promise<UserDocument> {
    return await this.userModel.findByIdAndDelete(id);
  }

  async getAllTheUserByElasticSearch(query: SearchUserDto) {

    const pageSize = parseInt(query.pageSize ?? '200');
    const current = parseInt(query.current ?? '1');
    const searchFilters = {
      query: {
        bool: {
          must: [],
          filter: [],
        },
      },
      size: pageSize,
      from: ((current - 1) * pageSize) | 0,
    };

    if (query.search) {
      let queryStr = ElasticSearchHelper.getFixedQueryString(query.search)
      searchFilters.query.bool.must.push({
        query_string: {
          // query: `\"*${query?.search}*\"`,
          query: queryStr,
          fields: ['name'],
        },
      });
    }

    delete query.search;
    delete query.current;
    delete query.search;
    delete query.pageSize;

    let queryString = '';
    const queryKeys = Object.keys(query);
    for (let i = 0; i < queryKeys.length; i++) {
      const splittedParts = (
        '"' +
        query[queryKeys[i]].split(',').join('" , "') +
        '"'
      )
        .split(',')
        .join(' OR ');

      queryString += `${queryKeys[i]}:(${splittedParts})`;

      if (i < queryKeys.length - 1) {
        queryString += ' AND ';
      }
    }

    if (queryString != '') {

      searchFilters.query.bool.must.push({
        query_string: {
          query: queryString,
        },
      });
    }

    const resp = await ElasticSearchHelper.search(
      IndexNames.users,
      searchFilters,
    );

    const data = resp.body?.hits?.hits;
    const count = resp.body?.hits?.total?.value ?? 0;
    return {
      data,
      count,
    };

  }
}
