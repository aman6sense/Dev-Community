import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ElasticSearchHelper, IndexNames } from 'src/helper/elastic.search.helper';
import { UserType } from 'src/user/model/user.userType.enum';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
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

    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {


      const expObj = {
        user: new mongoose.Types.ObjectId(createExperienceDto.user),
        CompanyName: createExperienceDto.CompanyName
          ? createExperienceDto.CompanyName
          : '',
        duration: createExperienceDto.duration ? createExperienceDto.duration : 0,
        description: createExperienceDto.description
          ? createExperienceDto.description
          : '',
      };

      const userId = expObj.user;

      if (!userId) {
        throw new NotFoundException('User is invalid');
      }

      const userExperience = await this.experienceModel.create(expObj);

      // push into ElasticSearch
      if (userExperience) {
        const experienceObj = userExperience.toObject();

        const res = await ElasticSearchHelper.index(IndexNames.experiences, experienceObj);

        if (!res) {
          this.logger.log("Not added experience to ElasticSearch")
        }
        else {
          console.log(res);
        }
      }

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

    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {


      const expObj = {

        CompanyName: updateExperienceDto.CompanyName
          ? updateExperienceDto.CompanyName
          : '',
        duration: updateExperienceDto.duration ? updateExperienceDto.duration : 0,
        description: updateExperienceDto.description
          ? updateExperienceDto.description
          : '',
      };

      console.log("id: ", userId);

      const updatedUser = await this.experienceModel.findOneAndUpdate(
        { user: new mongoose.Types.ObjectId(userId) },
        expObj,
        { new: true },
      );

      // push into ElasticSearch
      if (updatedUser) {
        const experienceObj = updatedUser.toObject();

        const res = await ElasticSearchHelper.index(IndexNames.experiences, experienceObj);

        if (!res) {
          this.logger.log("Not added experience to ElasticSearch")
        }
        else {
          console.log(res);
        }
      }



      console.log("update");

      return updatedUser;
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }


  }

  async getDeveloperExperienceById(userId: string, user: User) {


    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      return await this.experienceModel.find({ user: new mongoose.Types.ObjectId(userId) });
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }
  }

  async deleteExperienceWithExperienceId(id: string, user: User) {


    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      this.logger.log("id: ",id);
      
      const deleteUser = await this.experienceModel.findByIdAndDelete(id);

      this.logger.log("deleteUser: ", deleteUser);


      // Delete experience from ElasticSearch
      const res = await ElasticSearchHelper.remove(deleteUser.id, IndexNames.experiences);


      this.logger.log("deleteUser res: ", res);


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









}
