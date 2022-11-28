import { UpdatePostDto } from './dto/updatePostDto';

import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GetUser } from '../decorators/getUser.decorator';
import { User } from '../user/schema/user.schema';
import { CreatePostDto } from './dto/createPostDto';
import { SearchPostDto } from './dto/searchPostDto';
import { PostService } from './post.service';


// @UseGuards(AccessTokenGuard)
@Controller('post')
export class PostController {
  constructor(private postService: PostService) { }



  @Get()
  async getPostedUsers(@GetUser() user: User, @Query('page') page: number, @Query('count') count: number) {

    console.log("posted");

    return await this.postService.getAllPostedUsers(user, page, count);
  }


  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(createPostDto);
  }



  @Delete('/:postId')
  async deletePostWithPostId(
    @Param('postId') postId: string,
    @GetUser() user: User
  ) {

    console.log("delete post");

    return await this.postService.deletePostWithPostId(
      postId,
      user
    );
  }



  @Get("/search")
  async getPostFromElasticSearch(@GetUser() user: User, @Query() query: SearchPostDto) {

    console.log("search")

    return await this.postService.getPostFromElasticSearch(query)
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





}
