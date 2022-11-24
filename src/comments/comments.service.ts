import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AggregateHelper } from 'src/helper/AggregateHelper';
import { PostService } from 'src/post/post.service';
import { UserType } from 'src/user/model/user.userType.enum';
import { User } from 'src/user/schema/user.schema';
import { AddCommentDto } from './dto/addCommentDto';
import { UpdateCommentDto } from './dto/updateCommentDto';
import { Comments, CommentsDoc } from './schema/comments.schema';

@Injectable()
export class CommentService {
  private logger = new Logger("commentServiceLogger")
  constructor(
    @InjectModel(Comments.name) private commentsModel: Model<CommentsDoc>,
    // private userService: UserService,
    private postService: PostService,
  ) { }

  async addComment(addCommentDot: AddCommentDto, user: any) {

    // this.logger.verbose("=========USER=======", user)
    console.log("=========USER=======", user)
    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      const postExist = await this.postService.getPostById(addCommentDot?.postId?.toString());
      if (!postExist) {
        throw new NotFoundException('post is not exist');
      } else {
        const newComment = {
          post: new mongoose.Types.ObjectId(addCommentDot.postId),
          comment: addCommentDot.comment ? addCommentDot.comment : "",
          user: new mongoose.Types.ObjectId(user._id)
        };
        return await this.commentsModel.create(newComment);
      }

    } else {
      throw new UnauthorizedException('User not permitted');

    }
  }

  async updateComment(id: string, updateCommentDto: UpdateCommentDto, user: User) {

    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      const updateComment = {
        comment: updateCommentDto.comment ? updateCommentDto.comment : '',
      };

      return await this.commentsModel.findByIdAndUpdate(
        id,
        updateComment,
        { new: true, }

      );
    }

    else {
      throw new UnauthorizedException('User not permitted');

    }
  }

  async getUserAndPostFromComments(
    user,
    page,
    count
  ) {

    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      const aggregate = []
      //Populate user from table
      AggregateHelper.populateUser(aggregate)
      //Populate post from table
      AggregateHelper.populatePost(aggregate)
      //Show total count
      aggregate.push({ $count: 'count' })
      const total = await this.commentsModel.aggregate(aggregate).exec()
      aggregate.pop()
      aggregate.push({ $skip: (page - 1) * count });
      aggregate.push({ $limit: count * 1 });
      const data = await this.commentsModel.aggregate(aggregate).exec()

      return { data: data, count: total[0].count ? total[0].count : 0 };


    }
    else {
      throw new UnauthorizedException('User not permitted');

    }

  }


}
