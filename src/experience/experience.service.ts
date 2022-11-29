import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ElasticSearchHelper, IndexNames } from '../helper/elastic.search.helper';
import { UserType } from '../user/model/user.userType.enum';
import { User } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { CreateExperienceDto } from './dto/createExperienceDto';
import { SearchExperienceDto } from './dto/searchExperienceDto';
import { UpdateExperienceDto } from './dto/updateExperienceDto';
import { Experience, ExperienceDoc } from './schema/experience.schema';

@Injectable()
export class ExperienceService {
  private logger = new Logger('UserServiceLogger');

  constructor(
    @InjectModel(Experience.name)
    private experienceModel: Model<ExperienceDoc>,
    private userService: UserService,
  ) { }

  async addExperience(createExperienceDto: CreateExperienceDto, user: User) {

    if (this.checkUserType(user)) {
      const userId = createExperienceDto.user;
      if (!userId) {
        throw new NotFoundException('User is invalid');
      }
      const userExperience = await this.addNewExperience(createExperienceDto)
      // push into ElasticSearch
      // if (userExperience) {
      //   const experienceObj = userExperience.toObject();
      //   const res = await ElasticSearchHelper.index(IndexNames.experiences, experienceObj);
      //   if (!res) {
      //     this.logger.log("Not added experience to ElasticSearch")
      //   }
      //   else {
      //     console.log(res);
      //   }
      // }
      return userExperience;
    }
    else {
      throw new UnauthorizedException('User not permitted');
    }
  }

  async updateDeveloperExperienceById(
    userId: string,
    updateExperienceDto: UpdateExperienceDto,
    user: User
  ) {

    if (this.checkUserType(user)) {
      const updatedExperience = await this.updateExperience(updateExperienceDto, userId);
      // push into ElasticSearch
      // if (updatedExperience) {
      //   const experienceObj = updatedExperience.toObject();
      //   const res = await ElasticSearchHelper.index(IndexNames.experiences, experienceObj);
      //   if (!res) {
      //     this.logger.log("Not added experience to ElasticSearch")
      //   }
      //   else {
      //     console.log(res);
      //   }
      // }
      return updatedExperience;
    }
    else {
      throw new UnauthorizedException('User not permitted');
    }
  }

  async deleteExperienceWithExperienceId(id: string, user: User) {
    if (this.checkUserType(user)) {
      const deleteUser = await this.experienceModel.findByIdAndDelete(id);
      // // Delete experience from ElasticSearch
      // const res = await ElasticSearchHelper.remove(deleteUser.id, IndexNames.experiences);
      return deleteUser;
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }
  }
  async getExperienceFromElasticSearch(query: SearchExperienceDto) {

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
          fields: ['companyName', 'description', 'duration'],
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
      IndexNames.experiences,
      searchFilters,
    );

    const data = resp.body?.hits?.hits;
    const count = resp.body?.hits?.total?.value ?? 0;
    return {
      data,
      count,
    };
  }

  async addNewExperience(createExperienceDto: CreateExperienceDto) {
    const expObj = this.addExperienceImpl(createExperienceDto);
    return await this.experienceModel.create(expObj);
  }
  async updateExperience(updateExperienceDto: UpdateExperienceDto, userId: any) {
    const expObj = this.updateExperienceImpl(updateExperienceDto);
    return await this.experienceModel.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      expObj,
      { new: true },
    );

  }
  addExperienceImpl(createExperienceDto: CreateExperienceDto): {
    user: mongoose.Types.ObjectId;
    CompanyName: string;
    duration: number;
    description: string;

  } {
    return {
      user: new mongoose.Types.ObjectId(createExperienceDto.user),
      CompanyName: createExperienceDto.CompanyName
        ? createExperienceDto.CompanyName
        : '',
      duration: createExperienceDto.duration ? createExperienceDto.duration : 0,
      description: createExperienceDto.description
        ? createExperienceDto.description
        : '',
    }

  }


  updateExperienceImpl(updateExperienceDto: UpdateExperienceDto): {
    CompanyName: string;
    duration: number;
    description: string;

  } {
    return {
      CompanyName: updateExperienceDto.CompanyName
        ? updateExperienceDto.CompanyName
        : '',
      duration: updateExperienceDto.duration ? updateExperienceDto.duration : 0,
      description: updateExperienceDto.description
        ? updateExperienceDto.description
        : '',
    }

  }

  async getDeveloperExperienceById(userId: string, user: User) {

    if (this.checkUserType(user)) {
      return await this.experienceModel.findOne({ user: new mongoose.Types.ObjectId(userId) });
    }
    else {
      throw new UnauthorizedException('User not permitted');
    }
  }

  async checkUserType(user: any) {
    return user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA;
  }

}
