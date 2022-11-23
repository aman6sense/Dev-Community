import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserType } from 'src/user/model/user.userType.enum';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { CreateExperienceDto } from './dto/createExperienceDto';
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
        developer: new mongoose.Types.ObjectId(createExperienceDto.developer),
        CompanyName: createExperienceDto.CompanyName
          ? createExperienceDto.CompanyName
          : '',
        duration: createExperienceDto.duration ? createExperienceDto.duration : 0,
        description: createExperienceDto.description
          ? createExperienceDto.description
          : '',
      };

      const developer = expObj.developer;

      if (!developer) {
        throw new NotFoundException('Developer is invalid');
      }

      const userExperience = await this.experienceModel.create(expObj);

      return userExperience;
    }

    else {
      throw new UnauthorizedException('User not permitted');

    }


  }

  async updateDeveloperExperienceById(
    devId: string,
    updateExperienceDto: UpdateExperienceDto,
    user: User
  ) {

    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      const userExperience = await this.experienceModel.findOneAndUpdate(
        { developer: devId },
        updateExperienceDto,
        { new: true },
      );

      return userExperience;
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }


  }

  async getDeveloperExperienceById(devId: string, user: User) {

    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      return await this.experienceModel.find({ developer: devId });
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }
  }
}
