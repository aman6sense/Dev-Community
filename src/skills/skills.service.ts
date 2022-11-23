import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
      this.logger.verbose(addSkillsDto);

      const { developer, skills } = { ...addSkillsDto };

      const newSkills = {
        developer: addSkillsDto.developer ? addSkillsDto.developer : "",
        skills: addSkillsDto.skills ? addSkillsDto.skills : []
      }

      const userSkills = await this.skillsModel.create(addSkillsDto);

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
