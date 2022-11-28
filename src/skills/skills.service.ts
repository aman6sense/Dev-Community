import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ElasticSearchHelper, IndexNames } from '../helper/elastic.search.helper';
import { UserType } from '../user/model/user.userType.enum';
import { User } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { AddSkillsDto } from './dto/addSkillsDto';
import { SearchSkillsDto } from './dto/searchSkillsDto';
import { UpdateSkillsDto } from './dto/updateSkillsDto';
import { Skills, SkillsDocument } from './schema/skills.schema';

@Injectable()
export class SkillsService {
  private logger = new Logger('Usercontroller');

  constructor(
    @InjectModel(Skills.name) private skillsModel: Model<SkillsDocument>,
    private userService: UserService,
  ) { }

  async addSkills(addSkillsDto: AddSkillsDto, user: User) {

    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      // this.logger.verbose(addSkillsDto);

      const { user, skills } = { ...addSkillsDto };

      const newSkills = {
        user: new mongoose.Types.ObjectId(addSkillsDto.user),
        skills: addSkillsDto.skills ? addSkillsDto.skills : []
      }

      const userSkills = await this.skillsModel.create(newSkills);


      // push into ElasticSearch
      if (userSkills) {
        const skillsObj = userSkills.toObject();
        const res = await ElasticSearchHelper.index(IndexNames.skills, skillsObj);
        // this.logger.log("insert elastic: ", res)
      }

      return userSkills;
    }
    else {
      throw new UnauthorizedException('User not permitted');
    }
  }

  async updateDeveloperSkillsById(userId: string, updateSkillsDto: UpdateSkillsDto, user: User) {
    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      const updateSkills = {
        skills: updateSkillsDto.skills ? updateSkillsDto.skills : []
      }

      const userSkills = await this.skillsModel.findOneAndUpdate(
        { developer: userId },
        { $push: { skills: { $each: updateSkills.skills } } },
      );
      // console.log("updateUser: ", userSkills);


      // update skills into ElasticSearch
      if (userSkills) {
        const skillsObj = userSkills.toObject();
        const res = await ElasticSearchHelper.index(IndexNames.skills, skillsObj);
        // this.logger.log("update elastic: ", res);
      }

      return userSkills;
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }

  }


  async getUserSkillsByUserId(userId: any, user: User) {
    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      return await this.skillsModel.findOne({ user: userId });
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }
  }


  async getUsersFromElasticSearch(query: SearchSkillsDto) {

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
      IndexNames.skills,
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
