import { Post } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { PostService } from '../post/post.service';
import { PostSchema } from '../post/schema/post.schema';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { CommentsController } from './comments.controller';
import { CommentService } from './comments.service';
import { Comments, CommentsSchema } from './schema/comments.schema';


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
            .overrideProvider(UserService)
            .useValue(mockCommentService)
            .compile();

        commentService = module.get<CommentService>(CommentService);

        commentsController = module.get<CommentsController>(CommentsController);
    });


    it('SkillsService should be defined', () => {
        expect(commentService).toBeDefined();
    });




});