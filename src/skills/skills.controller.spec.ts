import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AppModule } from '../app.module';
import { UserType } from '../user/model/user.userType.enum';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { Skills, SkillsSchema } from './schema/skills.schema';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

const user = {
    "name": "aman01",
    "email": "aman01@gmail.com",
    "password": "password",
    "userType": UserType.BACKEND
}


const addSkillsData = {
    "user": new mongoose.Types.ObjectId("637f5657d26eaa0d094fd35f"),
    "skills": ['dd'],
}
const updateSkillsData = {
    // "_id": new mongoose.Types.ObjectId("63804a167d03d933821fc715"),

    "user": new mongoose.Types.ObjectId("638049a77d03d933821fc712"),
    "skills": ["ssk", "sssskk"]
}

describe('SkillsController', () => {
    let skillsController: SkillsController;
    let skillsService: SkillsService;
    const mockSkillsService = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forFeature([
                    { name: Skills.name, schema: SkillsSchema }, { name: User.name, schema: UserSchema },
                ]),
                AppModule
            ],
            controllers: [SkillsController],
            providers: [SkillsService, UserService],
        })
            .overrideProvider(UserService)
            .useValue(mockSkillsService)
            .compile();

        skillsService = module.get<SkillsService>(SkillsService);
        skillsController = module.get<SkillsController>(SkillsController);
    });


    it('SkillsService should be defined', () => {
        expect(skillsService).toBeDefined();
    });

    it("Test Add skills", async () => {

        const result = await skillsService.addSkills(addSkillsData, user)
        // console.log(result);
        // expect(result).toEqual(expect.any(Object))
        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),

            skills: expect.any(Array),
        }))
    })
    it("Test Update skills", async () => {

        const result = await skillsService.updateDeveloperSkillsById(updateSkillsData.user.toString(), updateSkillsData, user);
        // console.log(result);
        // expect(result).toEqual(expect.any(Object));
        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),

            skills: expect.any(Array),
        }))
    })
    it("Test getUserSkillsByUserId", async () => {

        const userId = new mongoose.Types.ObjectId("637c4bb91a9c0c0a2893d392");

        const result = await skillsService.getUserSkillsByUserId(userId, user);
        // console.log(result);
        // expect(result).toEqual(expect.any(Object));
        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),
            skills: expect.any(Array),
        }))
    })

});