import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AggregateHelper } from '../helper/AggregateHelper';
import { ElasticSearchHelper, IndexNames } from '../helper/elastic.search.helper';
import { PostService } from '../post/post.service';
import { UserType } from '../user/model/user.userType.enum';
import { User } from '../user/schema/user.schema';
import { AddCommentDto } from './dto/addCommentDto';
import { SearchCommentDto } from './dto/searchCommentDto';
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
    if (this.checkUserType(user)) {
      const postId = addCommentDot.post;
      const postExist = await this.postService.getPostById(postId);

      if (!postExist) {
        throw new NotFoundException('post is not exist');
      } else {

        const newData = this.postComment(addCommentDot, user)

        // if (newData) {
        //   const commentObj = newData;
        //   const res = await ElasticSearchHelper.index(IndexNames.comments, commentObj);
        // }
        return newData;
      }

    } else {
      throw new UnauthorizedException('User not permitted');
    }
  }
  async postComment(addCommentDot: AddCommentDto, user: User): Promise<any> {
    const newComment = this.commentImpl(addCommentDot, user);
    const comment = await this.commentsModel.create(newComment);
    return comment;
  }

  commentImpl(addCommentDot: AddCommentDto, user: any): { post: mongoose.Types.ObjectId; comment: string; user: mongoose.Types.ObjectId; } {
    return {
      post: new mongoose.Types.ObjectId(addCommentDot.post),
      comment: addCommentDot.comment ? addCommentDot.comment : "",
      user: new mongoose.Types.ObjectId(user._id)
    };
  }

  async checkUserType(user: any) {
    return user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA;
  }

  async updateComment(id: string, updateCommentDto: UpdateCommentDto, user: User) {

    if (this.checkUserType(user)) {
      const updateComment = this.updatePostComment(id, updateCommentDto);
      // push into ElasticSearch
      // if (updateComment) {
      //   const commentObj = updateComment;
      //   const res = await ElasticSearchHelper.index(IndexNames.comments, commentObj);
      // }
      return updateComment;
    }

    else {
      throw new UnauthorizedException('User not permitted');
    }
  }

  async updatePostComment(id: string, updateCommentDto: UpdateCommentDto) {
    const updateData = this.updateCommentImpl(updateCommentDto);
    return await this.commentsModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, }

    );
  }

  updateCommentImpl(updateCommentDto: UpdateCommentDto): { comment: string } {
    return { comment: updateCommentDto.comment ? updateCommentDto.comment : "" };
  }

  async getUserAndPostFromComments(
    user,
    page,
    count
  ) {

    if (this.checkUserType(user)) {

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

  async getCommentsFromElasticSearch(query: SearchCommentDto) {

    const pageSize = parseInt(query.pageSize ?? '200');
    const current = parseInt(query.current ?? '1');
    const searchFilters = {
      query: {
        bool: {
          must: [],
          filter: [],
        },
      },
      size: pageSize,
      from: ((current - 1) * pageSize) | 0,
    };

    if (query.search) {
      let queryStr = ElasticSearchHelper.getFixedQueryString(query.search)
      searchFilters.query.bool.must.push({
        query_string: {
          // query: `\"*${query?.search}*\"`,
          query: queryStr,
          fields: ['post', 'user', 'comment'],
        },
      });
    }

    delete query.search;
    delete query.current;
    delete query.search;
    delete query.pageSize;

    let queryString = '';
    const queryKeys = Object.keys(query);
    for (let i = 0; i < queryKeys.length; i++) {
      const splittedParts = (
        '"' +
        query[queryKeys[i]].split(',').join('" , "') +
        '"'
      )
        .split(',')
        .join(' OR ');

      queryString += `${queryKeys[i]}:(${splittedParts})`;

      if (i < queryKeys.length - 1) {
        queryString += ' AND ';
      }
    }

    if (queryString != '') {

      searchFilters.query.bool.must.push({
        query_string: {
          query: queryString,
        },
      });
    }

    const resp = await ElasticSearchHelper.search(
      IndexNames.comments,
      searchFilters,
    );

    const data = resp.body?.hits?.hits;
    const count = resp.body?.hits?.total?.value ?? 0;
    return {
      data,
      count,
    };
  }




  async deleteCommentWithCommentId(id: string, user: User) {

    if (this.checkUserType(user)) {

      const deleteComment = await this.commentsModel.findByIdAndDelete(id);

      // Delete comment from ElasticSearch
      // const res = await ElasticSearchHelper.remove(deleteComment.id, IndexNames.comments);

      return deleteComment;
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }
  }

}
