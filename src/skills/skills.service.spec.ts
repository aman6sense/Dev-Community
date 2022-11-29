import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
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

    "user": new mongoose.Types.ObjectId("637a75c89f6696c5973c6feb"),
    "skills": ["java", "pypy"]
}
const updateSkillsData = {
    "user": new mongoose.Types.ObjectId("637a75c89f6696c5973c6feb"),
    "skills": ["scripting", "go-leng"],
}
const skillsId = "6385f7e5f9c235900f611457";
const userId = "637a75c89f6696c5973c6feb";



describe(' Test suite', () => {
    let skillsService: SkillsService;
    const mockSkillsService = {
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [MongooseModule.forFeature([
                { name: Skills.name, schema: SkillsSchema },
                { name: User.name, schema: UserSchema }
            ]), AppModule
            ],
            controllers: [SkillsController],
            providers: [SkillsService, UserService],
        }).compile();

        skillsService = module.get<SkillsService>(SkillsService);
    });

    it('should be defined', () => {
        expect(skillsService).toBeDefined();
    });

    describe("Test Checking Skills Methods", () => {

        it("If a new skills are added, it should return an Object", async () => {
            const post = await skillsService.addNewSkills(addSkillsData);
            expect(post).toEqual(expect.objectContaining({
                user: expect.any(Object),
                skills: expect.any(Array),
            }))
        })
        it("After update the skills, it should return an Object", async () => {
            const post = await skillsService.updateExistingSkills(userId, updateSkillsData);
            expect(post).toEqual(expect.objectContaining({
                user: expect.any(Object),
                skills: expect.any(Array),
            }))
        })
        it("Getting user skills by userId, it should return an Object", async () => {
            const post = await skillsService.getUserSkillsByUserId(userId, user);
            expect(post).toEqual(expect.any(Array))
        })

    })


});