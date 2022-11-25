import {
  Injectable, Logger, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUserDto';
import { updateUserDto } from './dto/updateUserDto';
import { User, UserDocument } from './schema/user.schema';

import { ElasticSearchHelper, IndexNames } from 'src/helper/elastic.search.helper';
import { SearchUserDto } from './dto/searchUserDto';
import { UserType } from './model/user.userType.enum';






@Injectable()
export class UserService {
  private logger = new Logger("userService");
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<any> {



    const createUserData = {
      name: createUserDto.name ? createUserDto.name : "",
      email: createUserDto.email ? createUserDto.email : "",
      password: createUserDto.password?createUserDto.password:"",
      userType: createUserDto.userType
        ? createUserDto.userType
        : UserType.BACKEND,

    };
    const user = await this.userModel.create(createUserData);

    // const userObj = user.toObject();
    // delete userObj.password;

    return user;
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

    const existUser = await this.findById(id);

    if (!existUser) {
      throw new NotFoundException("User is not valid")
    }

    const updateUser = {
      name: updateUserDto.name ? updateUserDto.name : "",
      userType: updateUserDto.userType ? updateUserDto.userType : existUser.userType,

    }


    const resUser = await this.userModel
      .findByIdAndUpdate(id, updateUser, { new: true })
      ;

    // update user into ElasticSearch
    if (resUser) {
      const userObj = resUser.toObject();
      const res = await ElasticSearchHelper.index(IndexNames.users, userObj);

      if (!res) {
        this.logger.log("user are not update on ElasticSearch")
      }
      else {
        // this.logger.log("update res: ", res)
      }
    }

    return resUser;

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
