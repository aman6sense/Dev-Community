import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { GetUser } from '../decorators/getUser.decorator';
import { User } from '../user/schema/user.schema';
import { CreateExperienceDto } from './dto/createExperienceDto';
import { SearchExperienceDto } from './dto/searchExperienceDto';
import { UpdateExperienceDto } from './dto/updateExperienceDto';
import { ExperienceService } from './experience.service';



@UseGuards(AccessTokenGuard)
@Controller('experience')
export class ExperienceController {
  constructor(private ExperienceService: ExperienceService) { }

  @Post()
  async addSkills(
    @Body() createExperienceDto: CreateExperienceDto,
    @GetUser() user: User
  ) {
    return await this.ExperienceService.addExperience(createExperienceDto, user);
  }

  @Get('/search')
  async getExperienceFromElasticSearch(
    @Query() query: SearchExperienceDto
  ) {
    return await this.ExperienceService.getExperienceFromElasticSearch(query);
  }

  @Get('/:userId')
  async getDeveloperExperienceById(
    @Param('userId') userId: string,
    @GetUser() user: User
  ) {
    return await this.ExperienceService.getDeveloperExperienceById(userId, user);
  }


  @Patch('/:userId')
  async updateDeveloperExperienceById(
    @Param('userId') userId: string,
    @Body() updateExperienceDto: UpdateExperienceDto
    , @GetUser() user: User
  ) {
    return await this.ExperienceService.updateDeveloperExperienceById(
      userId,
      updateExperienceDto,
      user
    );
  }
  @Delete('/:userId')
  async deleteExperienceWithExperienceId(
    @Param('userId') userId: string,
    @Body() updateExperienceDto: UpdateExperienceDto
    , @GetUser() user: User
  ) {
    return await this.ExperienceService.deleteExperienceWithExperienceId(
      userId,
      user
    );
  }
}
