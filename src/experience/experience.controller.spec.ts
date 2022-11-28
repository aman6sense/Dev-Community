import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AppModule } from '../app.module';
import { UserType } from '../user/model/user.userType.enum';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';
import { Experience, ExperienceSchema } from './schema/experience.schema';


const user = {
    "name": "aman01",
    "email": "aman01@gmail.com",
    "password": "password",
    "userType": UserType.BACKEND
}


const addExperienceData = {
    "user": new mongoose.Types.ObjectId("637f5657d26eaa0d094fd35f"),
    "CompanyName": "6sense",
    "duration": 1,
    "description": "Here is my experience descriptions"
}
const updateExperienceData = {

    "CompanyName": "dotCo",
    "duration": 11,
    "description": "Here is my Update experience descriptions"
}

describe('ExperienceController', () => {
    let experienceController: ExperienceController;
    let experienceService: ExperienceService;
    const mockExperienceService = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forFeature([
                    { name: Experience.name, schema: ExperienceSchema },
                    { name: User.name, schema: UserSchema }
                ]),
                AppModule


            ],


            controllers: [ExperienceController],
            providers: [ExperienceService, UserService],
        })
            .overrideProvider(UserService)
            .useValue(mockExperienceService)
            .compile();

        experienceService = module.get<ExperienceService>(ExperienceService);
        experienceController = module.get<ExperienceController>(ExperienceController);
    });


    it('SkillsService should be defined', () => {
        expect(experienceService).toBeDefined();
    });

    it("Test Add Experience", async () => {

        const result = await experienceService.addExperience(addExperienceData, user)

        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),
            CompanyName: expect.any(String),
            duration: expect.any(Number),
            description: expect.any(String),


        }))
    })
    it("Test Update Experience", async () => {

        const userId = "638062490f3a8b9fa2a7e9f5";

        const result = await experienceService.updateDeveloperExperienceById(userId, updateExperienceData, user)

        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),
            CompanyName: expect.any(String),
            duration: expect.any(Number),
            description: expect.any(String),


        }))
    })
    it("Test getDeveloperExperienceByUserId ", async () => {

        const userId = "638062490f3a8b9fa2a7e9f5";

        const result = await experienceService.getDeveloperExperienceById(userId, user)

        expect(result).toEqual(expect.objectContaining({
            user: expect.any(Object),
            CompanyName: expect.any(String),
            duration: expect.any(Number),
            description: expect.any(String),


        }))
    })


});