import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { Skills, SkillsSchema } from './schema/skills.schema';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports:[MongooseModule.forFeature([{ name: Skills.name, schema: SkillsSchema },{ name: User.name, schema: userSchema }])],
  controllers: [SkillsController],
  providers: [SkillsService,UserService] ,
  exports:[SkillsService]
})
export class SkillsModule {}
