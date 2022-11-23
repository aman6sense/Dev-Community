import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';
import { UserService } from 'src/user/user.service';
import { User, userSchema } from 'src/user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: userSchema },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService, UserService],
  exports: [PostService],
})
export class PostModule {}
