import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AggregateHelper } from 'src/helper/AggregateHelper';
import { ElasticSearchHelper, IndexNames } from 'src/helper/elastic.search.helper';
import { UserType } from 'src/user/model/user.userType.enum';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { CreatePostDto } from './dto/createPostDto';
import { SearchPostDto } from './dto/searchPostDto';
import { UpdatePostDto } from './dto/updatePostDto';
import { Post, PostDocument } from './schema/post.schema';

@Injectable()
export class PostService {
  private logger = new Logger('PostServiceLogger');

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private userService: UserService,
  ) { }

  async createPost(createPostDto: CreatePostDto) {
    const newPost = {
      user: new mongoose.Types.ObjectId(createPostDto.user),
      title: createPostDto.title,
      post: createPostDto.post,
    };

    const isValidUser = await this.userService.findById(
      newPost.user ? newPost.user : '',
    );

    if (!isValidUser) {
      this.logger.verbose('isValid: ', isValidUser);
      throw new NotFoundException('You not a valid Developer');
    }

    const post = await this.postModel.create(newPost);

    // push into ElasticSearch
    if (post) {
      const postObj = post.toObject();
      const res = await ElasticSearchHelper.index(IndexNames.posts, postObj);
      // this.logger.log("insert elastic: ", res)
    }


    return post;
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto) {


    const existPost = await this.postModel.findById(new mongoose.Types.ObjectId(id));

    if (!existPost) {
      throw new NotFoundException('Post is not found');
    }

    const newPost = {
      title: updatePostDto.title,
      post: updatePostDto.post,
      tags: [...new Set([...updatePostDto.tags, ...existPost.tags])],
    };
    this.logger.verbose('newPost: ', newPost);

    const updatePost = await this.postModel.findByIdAndUpdate(id, newPost, { new: true });


    // push into ElasticSearch
    if (updatePost) {

      const postObj = updatePost.toObject();
      const res = await ElasticSearchHelper.index(IndexNames.posts, postObj);
    }
    return updatePost
  }

  async getPostById(id: string) {

    // this.logger.verbose("id: ", id)
    return await this.postModel.findById(id);
  }



  async getAllPostedUsers(user: any, page: any, count: any) {

    const aggregate = []
    //Populate user from table
    AggregateHelper.populateUser(aggregate)
    //Populate post from table
    AggregateHelper.populatePost(aggregate)
    //Show total count
    aggregate.push({ $count: 'count' })
    const total = await this.postModel.aggregate(aggregate).exec()
    aggregate.pop()
    aggregate.push({ $skip: (page - 1) * count });
    aggregate.push({ $limit: count * 1 });
    const data = await this.postModel.aggregate(aggregate).exec()

    return { data: data, count: total[0].count ? total[0].count : 0 };

  }




  async getPostFromElasticSearch(query: SearchPostDto) {

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
          fields: ['user', 'title', 'post', 'tags'],
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
      IndexNames.posts,
      searchFilters,
    );

    const data = resp.body?.hits?.hits;
    const count = resp.body?.hits?.total?.value ?? 0;
    return {
      data,
      count,
    };
  }




  async deletePostWithPostId(id: string, user: User) {

    if (user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA) {

      const deletePost = await this.postModel.findByIdAndDelete(id);

      // Delete experience from ElasticSearch
      const res = await ElasticSearchHelper.remove(deletePost.id, IndexNames.posts);

      return deletePost;
    }
    else {
      throw new UnauthorizedException('User not permitted');

    }
  }

}
