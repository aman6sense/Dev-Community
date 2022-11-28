import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GetUser } from '../decorators/getUser.decorator';
import { User } from '../user/schema/user.schema';
import { AddSkillsDto } from './dto/addSkillsDto';
import { SearchSkillsDto } from './dto/searchSkillsDto';
import { UpdateSkillsDto } from './dto/updateSkillsDto';
import { SkillsService } from './skills.service';


// @UseGuards(AccessTokenGuard)
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

  @Get('/:userId')
  async getDeveloperSkillsByUserId(
    @Param('userId') userId: string,
    @GetUser() user: User
  ) {
    return await this.skillsService.getUserSkillsByUserId(userId, user);
  }

  @Patch('/:userId')
  async updateDeveloperSkillsById(
    @Param('userId') userId: string,
    @Body() updateSkillsDto: UpdateSkillsDto,
    @GetUser() user: User
  ) {
    return await this.skillsService.updateDeveloperSkillsById(
      userId,
      updateSkillsDto,
      user
    );
  }




}
