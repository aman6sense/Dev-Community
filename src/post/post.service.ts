import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AggregateHelper } from 'src/helper/AggregateHelper';
import { UserService } from 'src/user/user.service';
import { CreatePostDto } from './dto/createPostDto';
import { UpdatePostDto } from './dto/updatePostDto';
import { Post, PostDocument } from './schema/post.schema';

@Injectable()
export class PostService {
  private logger = new Logger('PostServiceLogger');

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private userService: UserService,
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    const newPost = {
      userId: new mongoose.Types.ObjectId(createPostDto.userId),
      title: createPostDto.title,
      post: createPostDto.post,
    };

    const isValidUser = await this.userService.findById(
      newPost.userId ? newPost.userId : '',
    );

    if (!isValidUser) {
      this.logger.verbose('isValid: ', isValidUser);
      throw new NotFoundException('You not a valid Developer');
    }
    // check status
    return await this.postModel.create(newPost);
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto) {
    const existPost = await this.postModel.findById(id);

    if (!existPost) {
      throw new NotFoundException('Post is not found');
    }

    const newPost = {
      title: updatePostDto.title,
      post: updatePostDto.post,
      tags: [...new Set([...updatePostDto.tags, ...existPost.tags])],
    };
    this.logger.verbose('newPost: ', newPost);

    return await this.postModel.findByIdAndUpdate(id, newPost, { new: true });
  }

  async getPostById(id: string) {
    // this.logger.verbose("id: ", id)
    return await this.postModel.findById(id);
  }

  async getAllPostedUsers(user: any, page: any, count: any) {
    const aggregate = [];
    //Populate user from table
    AggregateHelper.populateUser(aggregate);
    //Populate post from table
    AggregateHelper.populatePost(aggregate);
    //Show total count
    aggregate.push({ $count: 'count' });
    const total = await this.postModel.aggregate(aggregate).exec();
    aggregate.pop();
    aggregate.push({ $skip: (page - 1) * count });
    aggregate.push({ $limit: count * 1 });
    const data = await this.postModel.aggregate(aggregate).exec();

    return { data: data, count: total[0].count ? total[0].count : 0 };
  }
}
