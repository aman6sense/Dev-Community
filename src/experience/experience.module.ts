import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';
import { Experience, ExperienceSchema } from './schema/experience.schema';

@Module({
  imports:[MongooseModule.forFeature([{ name: Experience.name, schema: ExperienceSchema },{ name: User.name, schema: userSchema }])],

  controllers: [ExperienceController],
  providers: [ExperienceService,UserService]
})
export class ExperienceModule {}
