import { Post } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
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
    "post": new mongoose.Types.ObjectId("63809e7adab1a9eeeb34d887"),
    "user": new mongoose.Types.ObjectId("637a781274736c71ef306d7e"),
    "comment": "this is test comment"
}
const updateUpdateData = {
    "comment": "this is test comment"
}
const commentId = "6380a5cb2117880c8137effc";

describe(' Test suite', () => {

    let commentsController: CommentsController;
    let commentService: CommentService;

    const mockCommentService = {
        getPostById: () => { }

    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
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

    it('should be defined', () => {
        expect(commentService).toBeDefined();
    });

    describe("Test Checking User Type", () => {

        it("If user type is backend it should return true", async () => {

            const result = await commentService.checkUserType(user)

            expect(result).toBeTruthy()
        })
        it("If user type is fronend it should return true", async () => {

            user.userType = UserType.FRONTEND
            const result = await commentService.checkUserType(user)

            expect(result).toBeTruthy()
        })
        it("If user type is SQA it should return true", async () => {

            user.userType = UserType.SQA
            const result = await commentService.checkUserType(user)

            expect(result).toBeTruthy()
        })
        it("If user type is normal it should return false", async () => {

            user.userType = UserType.Normal
            const result = await commentService.checkUserType(user)

            expect(result).toBeFalsy()
        })
    })
    describe("Test Checking Comment", () => {

        it("If a comment is added, it should return an Object", async () => {
            const comment = await commentService.postComment(addCommentData, user);
            expect(comment).toEqual(expect.objectContaining({
                post: expect.any(Object),
                user: expect.any(Object),
                comment: expect.any(String)
            }))
        })

        it("If a comment is Updated, it should return an Object", async () => {
            const comment = await commentService.updatePostComment(commentId, updateUpdateData);
            expect(comment).toEqual(expect.objectContaining({
                post: expect.any(Object),
                user: expect.any(Object),
                comment: expect.any(String)
            }))
        })

        it("If a comment is Deleted, it should return an Object", async () => {
            const comment = await commentService.deleteCommentWithCommentId(commentId, user);
            expect(comment).toEqual(expect.any(Object))
        })
    })
  


});