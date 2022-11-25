import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetUser } from 'src/decorators/getUser.decorator';
import { User } from 'src/user/schema/user.schema';
import { AddSkillsDto } from './dto/addSkillsDto';
import { SearchSkillsDto } from './dto/searchSkillsDto';
import { UpdateSkillsDto } from './dto/updateSkillsDto';
import { SkillsService } from './skills.service';


@UseGuards(AccessTokenGuard)
@Controller('skills')
export class SkillsController {
  constructor(private skillsService: SkillsService) { }

  @Post()
  async addSkills(
    @Body() addSkillsDto: AddSkillsDto,
    @GetUser() user: User
  ) {
    return await this.skillsService.addSkills(addSkillsDto, user);
  }

  @Get("/search")
  async getUsersFromElasticSearch(@GetUser() user: User, @Query() query: SearchSkillsDto) {

    return await this.skillsService.getUsersFromElasticSearch(query)

  }

  // @Get('/:devId')
  // async getDeveloperSkillsById(
  //   @Param('devId') devId: string,
  //   @GetUser() user: User
  // ) {
  //   return await this.skillsService.getDeveloperSkillsById(devId, user);
  // }
  @Patch('/:devId')
  async updateDeveloperSkillsById(
    @Param('devId') devId: string,
    @Body() updateSkillsDto: UpdateSkillsDto,
    @GetUser() user: User
  ) {
    return await this.skillsService.updateDeveloperSkillsById(
      devId,
      updateSkillsDto,
      user
    );
  }




}
