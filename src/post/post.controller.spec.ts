import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AppModule } from '../app.module';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
// import { User, UserSchema } from 'src/user/schema/user.schema';
// import { UserService } from 'src/user/user.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from './schema/post.schema';


const updatePost = {
    "_id": new mongoose.Types.ObjectId("63809e7adab1a9eeeb34d887"),
    "user": new mongoose.Types.ObjectId("638089a086556b702819dd73"),
    "title": "update test post ",
    "post": "update the post form testing page",
    "tags": ['aaa', 'bbb'],
}
const post = {
    "user": new mongoose.Types.ObjectId("637db774080b0874ee4c318b"),
    "title": "react problem",
    "post": "i cant setup react.please help",
}
const user = {
    "_id": "637a75c89f6696c5973c6feb",
    "name": "aman01",
    "email": "aman01@gmail.com",
    "userType": "Backend",
}

describe('PostController', () => {

    let postController: PostController;
    let postService: PostService;
    const mockUserService = {}

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forFeature([
                    { name: Post.name, schema: PostSchema },
                    { name: User.name, schema: UserSchema },
                ]),
                AppModule
            ],
            controllers: [PostController],
            providers: [PostService, UserService],
        })
            .overrideProvider(UserService)
            .useValue(mockUserService)
            .compile();

        postController = module.get<PostController>(PostController);
        postService = module.get<PostService>(PostService);
    });

    it('PostController should be defined', () => {
        expect(postService).toBeDefined();
    });

    it("Test create post", async () => {

        const result = await postService.createPost(post)
        // console.log(result);
        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),
            title: expect.any(String),
            post: expect.any(String),
            tags: expect.any(Array),
        }))
    })
    it("Test update post", async () => {

        const result = await postService.createPost(updatePost)
        // console.log(result);
        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),
            title: expect.any(String),
            post: expect.any(String),
            tags: expect.any(Array),
        }))
    })
    it("Test getPostedUser post", async () => {

        const result = await postService.getAllPostedUsers(user, 1, 50);
        // console.log(result);
        expect(result).toEqual(expect.objectContaining({
            data: expect.any(Array),
            count: expect.any(Number),

        }))
    })
});