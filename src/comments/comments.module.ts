import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from '../post/post.service';
import { Post, PostSchema } from '../post/schema/post.schema';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { CommentsController } from './comments.controller';
import { CommentService } from './comments.service';
import { Comments, CommentsSchema } from './schema/comments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comments.name, schema: CommentsSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentService, PostService, UserService],
  exports: [CommentService],
})
export class CommentsModule { }
