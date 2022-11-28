import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';



export type SkillsDocument = Skills & Document;

@Schema({ timestamps: true })
export class Skills {

    @Prop({ type: mongoose.Types.ObjectId, ref: "User", required: true })
    user: mongoose.Types.ObjectId;

    @Prop({ type: [String], required: [true, "Add some skills"] })
    skills: string[];
}

export const SkillsSchema = SchemaFactory.createForClass(Skills);
