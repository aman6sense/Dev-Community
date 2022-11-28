import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { GetUser } from '../decorators/getUser.decorator';
import { User } from '../user/schema/user.schema';
import { CommentService } from './comments.service';
import { AddCommentDto } from './dto/addCommentDto';
import { SearchCommentDto } from './dto/searchCommentDto';
import { UpdateCommentDto } from './dto/updateCommentDto';



@UseGuards(AccessTokenGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentService: CommentService) { }


  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllComments(@GetUser() user: User, @Query('page') page: number, @Query('count') count: number) {
    return this.commentService.getUserAndPostFromComments(user, page, count);
  }



  @Post()
  @UseGuards(AuthGuard('jwt'))
  async addComment(@Body() addCommentDto: AddCommentDto, @GetUser() user: User) {
    return this.commentService.addComment(addCommentDto, user);
  }



  @Delete('/:commentId')
  async deleteCommentWithCommentId(
    @Param('commentId') commentId: string,
    @GetUser() user: User
  ) {

    console.log("delete post");

    return await this.commentService.deleteCommentWithCommentId(
      commentId,
      user
    );
  }

  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User
  ) {
    return await this.commentService.updateComment(id, updateCommentDto, user);
  }


  @Get("/search")
  async getCommentFromElasticSearch(@GetUser() user: User, @Query() query: SearchCommentDto) {

    console.log("search")

    return await this.commentService.getCommentsFromElasticSearch(query)
  }



}
