import { IsNotEmpty } from "class-validator";
import mongoose from 'mongoose';



export class UpdateSkillsDto {

    @IsNotEmpty({ message: "Select a Developer(User)" })
    user: mongoose.Types.ObjectId;


    @IsNotEmpty({ message: "Please put your skills" })
    skills: string[];
}
