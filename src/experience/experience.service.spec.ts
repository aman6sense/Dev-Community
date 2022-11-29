import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { User, UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';

import mongoose from 'mongoose';
import { UserType } from '../user/model/user.userType.enum';
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

    "user": new mongoose.Types.ObjectId("637a75c89f6696c5973c6feb"),
    "CompanyName": "New known Ltd.",
    "duration": 3,
    "description": "I am from known Ltd."
}
const updateExperienceData = {
    "CompanyName": "known Ltd.",
    "duration": 3,
    "description": "updated, I am from known Ltd."
}
const experienceId = "6385dadde4c7548027d82613";
const userId = "637a75c89f6696c5973c6feb";


describe('Controller', () => {
    let experienceController: ExperienceController;
    let experienceService: ExperienceService;
    const mockExperienceService = {
    };


    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [MongooseModule.forFeature([
                { name: Experience.name, schema: ExperienceSchema },
                { name: User.name, schema: UserSchema }
            ]), AppModule
            ],
            controllers: [ExperienceController],
            providers: [ExperienceService, UserService]
        })
            // .overrideProvider(UserService)
            // .useValue(mockExperienceService)
            .compile();

        experienceService = module.get<ExperienceService>(ExperienceService);
        experienceController = module.get<ExperienceController>(ExperienceController);
    });

    it('should be defined', () => {
        expect(experienceService).toBeDefined();
    });

    describe("Test Checking experience Methods", () => {

        it("If a new experience is added, it should return an Object", async () => {
            const experience = await experienceService.addNewExperience(addExperienceData);
            expect(experience).toEqual(expect.objectContaining({
                user: expect.any(Object),
                CompanyName: expect.any(String),
                duration: expect.any(Number),
                description: expect.any(String),
            }))
        })
        it("If the existing experience updated, it should return an Object", async () => {
            const experience = await experienceService.updateExperience(updateExperienceData, userId);
            expect(experience).toEqual(expect.objectContaining({
                user: expect.any(Object),
                CompanyName: expect.any(String),
                duration: expect.any(Number),
                description: expect.any(String),
            }))
        })
        it("After delete experience, it should return an Object", async () => {
            const experience = await experienceService.deleteExperienceWithExperienceId(experienceId, user);
            expect(experience).toEqual(expect.any(Object))
        })

        it("If get experience by id, it should return an Object", async () => {
            const experience = await experienceService.getDeveloperExperienceById(userId, user);
            expect(experience).toEqual(expect.objectContaining({
                user: expect.any(Object),
                CompanyName: expect.any(String),
                duration: expect.any(Number),
                description: expect.any(String),
            }))
        })
    })


});