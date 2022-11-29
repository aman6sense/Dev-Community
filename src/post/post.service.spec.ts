import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AppModule } from '../app.module';
import { UserType } from '../user/model/user.userType.enum';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from './schema/post.schema';

const user = {
    "name": "aman01",
    "email": "aman01@gmail.com",
    "password": "password",
    "userType": UserType.BACKEND
}
const addPostData = {

    "user": new mongoose.Types.ObjectId("637a75c89f6696c5973c6feb"),
    "title": "Test title",
    "post": "Consider this is a post! :<3",
    "tags": ["funny", "notFunny"],
}
const updatePostData = {
    "title": "update Test title",
    "post": "update Consider this is a post! :<3",
    "tags": ["updatefunny", "notFunny"],
}
const postId = "6384775ccf7bf19ed594f3d5";
const userId = "637a75c89f6696c5973c6feb";

describe(' Test suite', () => {
    let postService: PostService;
    const mockPostService = {
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forFeature([
                    { name: Post.name, schema: PostSchema },
                    { name: User.name, schema: UserSchema },
                ]), AppModule
            ],
            controllers: [PostController],
            providers: [PostService, UserService],
        })
            // .overrideProvider(PostService)
            // .useValue(mockPostService)
            .compile();
    
        postService = module.get<PostService>(PostService);
    });

    it('should be defined', () => {
        expect(postService).toBeDefined();
    });

    describe("Test Checking post Methods", () => {

        it("If a new post is added, it should return an Object", async () => {
            const post = await postService.createNewPost(addPostData);
            expect(post).toEqual(expect.objectContaining({
                user: expect.any(Object),
                title: expect.any(String),
                post: expect.any(String),
                tags: expect.any(Array),
            }))
        })
        it("If the existing post is updated, it should return an Object", async () => {
            const post = await postService.updateExistingPost(postId, updatePostData);
            expect(post).toEqual(expect.objectContaining({
                user: expect.any(Object),
                title: expect.any(String),
                post: expect.any(String),
                tags: expect.any(Array),
            }))
        })
        it("After delete the post, it should return an Object", async () => {
            const post = await postService.deletePostWithPostId(postId, user);
            expect(post).toEqual(expect.any(Object))
        })
        it("If get the all posted users, it should return an Array Object", async () => {
            const post = await postService.getAllPostedUsers(user, 1, 100);
            expect(post).toEqual(expect.objectContaining({
                count: expect.any(Number),
                data: expect.any(Array)
            }))
        })
    })

});