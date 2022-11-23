import { UpdatePostDto } from './dto/updatePostDto';

import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GetUser } from 'src/decorators/getUser.decorator';
import { User } from 'src/user/schema/user.schema';
import { CreatePostDto } from './dto/createPostDto';
import { PostService } from './post.service';


// @UseGuards(AccessTokenGuard)
@Controller('post')
export class PostController {
  constructor(private postService: PostService) { }

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(createPostDto);
  }
  @Patch('/:id')
  async updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') id: string,
  ) {
    return this.postService.updatePost(id, updatePostDto);
  }

  @Get('/:id')
  async getPostById(@Param('id') id: string) {
    return await this.postService.getPostById(id);
  }
  @Get()
  async getPostedUsers(@GetUser() user: User, @Query('page') page: number, @Query('count') count: number) {

    console.log("posted");

    return await this.postService.getAllPostedUsers(user, page, count);
  }





}
