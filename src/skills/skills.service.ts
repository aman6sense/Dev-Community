import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ElasticSearchHelper, IndexNames } from 'src/helper/elastic.search.helper';
import { UserType } from 'src/user/model/user.userType.enum';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { AddSkillsDto } from './dto/addSkillsDto';
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
        this.logger.log("insert elastic: ", res)
      }

      return userSkills;
    }
    else {
      throw new UnauthorizedException('User not permitted');
    }
  }

  async updateDeveloperSkillsById(devId: string, updateSkillsDto: UpdateSkillsDto, user: User) {
    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      const updateSkills = {
        skills: updateSkillsDto.skills ? updateSkillsDto.skills : []
      }

      const userSkills = await this.skillsModel.findOneAndUpdate(
        { developer: devId },
        { $push: { skills: { $each: updateSkills.skills } } },
      );
      console.log("updateUser: ", userSkills);


      // update skills into ElasticSearch
      if (userSkills) {
        const skillsObj = userSkills.toObject();
        const res = await ElasticSearchHelper.index(IndexNames.skills, skillsObj);
        this.logger.log("update elastic: ", res);
      }

      return userSkills;
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }

  }


  async getDeveloperSkillsById(devId: string, user: User) {
    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      return await this.skillsModel.find({ developer: devId });
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }
  }







  
}
