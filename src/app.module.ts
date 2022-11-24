import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from './post/post.module';

import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { ExperienceModule } from './experience/experience.module';
import { SkillsModule } from './skills/skills.module';
import { UserModule } from './user/user.module';

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
export class AppModule { }
