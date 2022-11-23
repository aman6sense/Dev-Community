import { Controller, Get, Post, Patch, Delete, Body,Param, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetUser } from 'src/decorators/getUser.decorator';
import { User } from 'src/user/schema/user.schema';
import { CreateExperienceDto } from './dto/createExperienceDto';
import { UpdateExperienceDto } from './dto/updateExperienceDto';
import { ExperienceService } from './experience.service';



  @UseGuards(AccessTokenGuard)
  @Controller('experience')
  export class ExperienceController {
    constructor(private ExperienceService: ExperienceService) {}

    @Post()
    async addSkills(
      @Body() createExperienceDto: CreateExperienceDto,
      @GetUser()user:User
      ) {
      return await this.ExperienceService.addExperience(createExperienceDto,user);
    }

    @Get('/:devId')
    async getDeveloperExperienceById(
      @Param('devId') devId: string,
       @GetUser() user: User
       ) {
      return await this.ExperienceService.getDeveloperExperienceById(devId,user);
    }


    @Patch('/:devId')
    async updateDeveloperExperienceById(
      @Param('devId') devId: string,
      @Body() updateExperienceDto: UpdateExperienceDto
      , @GetUser() user: User
    ) {
      return await this.ExperienceService.updateDeveloperExperienceById(
        devId,
        updateExperienceDto,
        user
      );
    }
  }
