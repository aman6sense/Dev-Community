import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUser.decorator';
import { User } from 'src/user/schema/user.schema';
import { CommentService } from './comments.service';
import { AddCommentDto } from './dto/addCommentDto';
import { UpdateCommentDto } from './dto/updateCommentDto';



// @UseGuards(AccessTokenGuard)
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

  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User
  ) {
    return await this.commentService.updateComment(id, updateCommentDto, user);
  }


}
