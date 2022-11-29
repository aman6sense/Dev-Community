import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AggregateHelper } from '../helper/AggregateHelper';
import { ElasticSearchHelper, IndexNames } from '../helper/elastic.search.helper';
import { UserType } from '../user/model/user.userType.enum';
import { User } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
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
    const isValidUser = await this.userService.findById(
      createPostDto.user
    );

    if (!isValidUser) {
      this.logger.verbose('isValid: ', isValidUser);
      throw new NotFoundException('You not a valid Developer');
    }
    const post = await this.createNewPost(createPostDto);

    // push into ElasticSearch
    // if (post) {
    //   const postObj = post.toObject();
    //   const res = await ElasticSearchHelper.index(IndexNames.posts, postObj);
    //   // this.logger.log("insert elastic: ", res)
    // }
    return post;
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto) {
    const existPost = await this.postModel.findById(new mongoose.Types.ObjectId(id));
    if (!existPost) {
      throw new NotFoundException('Post is not found');
    }

    const postData = this.updatePostDtoImpl(existPost, updatePostDto);

    const updatePost = await this.updateExistingPost(id, postData);

    // push into ElasticSearch
    // if (updatePost) {

    //   const postObj = updatePost.toObject();
    //   const res = await ElasticSearchHelper.index(IndexNames.posts, postObj);
    // }
    return updatePost
  }

  async getPostById(id: any) {

    console.log("id: ", id)
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

    if (this.checkUserType(user)) {
      const deletePost = await this.postModel.findByIdAndDelete(id);
      // Delete experience from ElasticSearch
      // const res = await ElasticSearchHelper.remove(deletePost.id, IndexNames.posts);
      return deletePost;
    }
    else {
      throw new UnauthorizedException('User not permitted');
    }
  }

  async createNewPost(createPostDto: CreatePostDto) {
    const postData = this.createPostDtoImpl(createPostDto);
    return await this.postModel.create(postData);
  }
  async updateExistingPost(id: any, postData: UpdatePostDto) {
    return await this.postModel.findByIdAndUpdate(id, postData, { new: true });
  }

  createPostDtoImpl(createPostDto: CreatePostDto): {
    user: mongoose.Types.ObjectId;
    title: string;
    post: string;
  } {

    return {
      user: new mongoose.Types.ObjectId(createPostDto.user),
      title: createPostDto.title,
      post: createPostDto.post,
    };
  }
  updatePostDtoImpl(existPost: Post, updatePostDto: UpdatePostDto): {
    title: string;
    post: string;
    tags: string[];
  } {

    return {
      title: updatePostDto.title,
      post: updatePostDto.post,
      tags: [...new Set([...updatePostDto.tags, ...existPost.tags])],
    };

  }
  async checkUserType(user: any) {
    return user.userType == UserType.BACKEND || user.userType == UserType.FRONTEND || user.userType == UserType.SQA;
  }
}
