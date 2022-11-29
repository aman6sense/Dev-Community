import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { UserType } from './model/user.userType.enum';
import { User, UserSchema } from './schema/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';


const user = {
    "name": "aman01",
    "email": "aman01@gmail.com",
    "password": "password",
    "userType": UserType.BACKEND
}
const createUserData = {
    "name": "testing user",
    "email": "testing@gmail.com",
    "password": "tesging",
    "userType": UserType.BACKEND

}
const updateUserData = {
    "name": "testing user update",
    "userType": UserType.FRONTEND
}
const userId = "638600254d64c20b0ef5d524";



describe(' Test suite', () => {
    let userService: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [

                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema }
                ]), AppModule

            ],
            controllers: [UserController],
            providers: [UserService],
        }).compile();

        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
    });
    describe("Test Checking Skills Methods", () => {

        it("If a new User created, it should return an Object of new user", async () => {
            const user = await userService.createNewUser(createUserData);
            expect(user).toEqual(expect.objectContaining({
                name: expect.any(String),
                email: expect.any(String),
            }))
        })
        it("After updated user info, it should return an Object of updated user", async () => {
            const user = await userService.updateExistingUser(userId, updateUserData);
            expect(user).toEqual(expect.objectContaining({
                name: expect.any(String),
                email: expect.any(String),
            }))
        })
        it("After Delete user info, it should return an Object of deleted user", async () => {
            const user = await userService.remove(userId);
            expect(user).toEqual(expect.any(Object))
        })

    })


});