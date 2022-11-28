import { Post } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AppModule } from '../app.module';
import { PostService } from '../post/post.service';
import { PostSchema } from '../post/schema/post.schema';
import { UserType } from '../user/model/user.userType.enum';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { CommentsController } from './comments.controller';
import { CommentService } from './comments.service';
import { Comments, CommentsSchema } from './schema/comments.schema';

const user = {
    "name": "aman01",
    "email": "aman01@gmail.com",
    "password": "password",
    "userType": UserType.BACKEND
}


const addCommentData = {
    "post": new mongoose.Types.ObjectId("63809f54c2b0dafba034e9b1"),
    "user": new mongoose.Types.ObjectId("637a7d5fb486bb22a61bc38f"),
    "comment": "this is test comment"
}
const updateUpdateData = {
    "comment": "this is test comment"
}


describe('CommentsController', () => {
    let commentsController: CommentsController;
    let commentService: CommentService;
    const mockCommentService = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forFeature([

                    { name: Comments.name, schema: CommentsSchema },

                    { name: Post.name, schema: PostSchema },

                    { name: User.name, schema: UserSchema },
                ]),
                AppModule
            ],
            controllers: [CommentsController],
            providers: [CommentService, PostService, UserService],
        })
            .overrideProvider(PostService)
            .useValue(mockCommentService)
            .compile();

        commentService = module.get<CommentService>(CommentService);

        commentsController = module.get<CommentsController>(CommentsController);
    });


    it('SkillsService should be defined', () => {
        expect(commentService).toBeDefined();
    });

    it("Test Add Comment", async () => {

        const result = await commentService.addComment(addCommentData, user)

        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),
            post: expect.any(Object),
            comment: expect.any(String),


        }))
    })
    // it("Test update Comment", async () => {
    //     const commentId = "";
    //     const result = await commentService.updateComment(commentId, addCommentData, user)

    //     expect(result).toEqual(expect.objectContaining({
    //         user: expect.any(Object),
    //         post: expect.any(Object),
    //         comment: expect.any(String),


    //     }))
    // })



});