import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { IsNotEmpty } from "class-validator";



export class AddSkillsDto{
    
    @IsNotEmpty({ message: "Select a Developer(User)" })
    developer:mongoose.Types.ObjectId;


    @IsNotEmpty({ message: "Please put your skills" })
    skills:[string];
}




