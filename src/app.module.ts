import { PostModule } from './post/post.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './user/user.module';
import { ExperienceModule } from './experience/experience.module';
import { SkillsModule } from './skills/skills.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(
      'mongodb+srv://restaurantreview:restaurantreview@cluster0.d0akukp.mongodb.net/?retryWrites=true&w=majority',
    ),
    ExperienceModule,
    SkillsModule,
    PostModule,
    CommentsModule,
    AuthModule,
 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
