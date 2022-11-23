import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetUser } from 'src/decorators/getUser.decorator';
import { User } from 'src/user/schema/user.schema';
import { AddSkillsDto } from './dto/addSkillsDto';
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

  @Get('/:devId')
  async getDeveloperSkillsById(
    @Param('devId') devId: string,
    @GetUser() user: User
  ) {
    return await this.skillsService.getDeveloperSkillsById(devId, user);
  }
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
