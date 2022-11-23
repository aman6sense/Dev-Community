import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Comments, CommentsSchema } from './schema/comments.schema';
import { CommentsController } from './comments.controller';
import { CommentService } from './comments.service';
import { Post, PostSchema } from 'src/post/schema/post.schema';
import { User, userSchema } from 'src/user/schema/user.schema';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comments.name, schema: CommentsSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: userSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentService, PostService, UserService],
  exports: [CommentService],
})
export class CommentsModule {}
