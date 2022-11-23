import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";



export type ExperienceDoc = Experience & Document;
@Schema()
export class Experience{

    @Prop({type:mongoose.Types.ObjectId,ref:"User"})
    developer:mongoose.Types.ObjectId;

    @Prop({ type: String, required: [true, "Add company name"] })
    CompanyName: string;

    @Prop({ type: Number, required: [true, "Add duration name"] })
    duration:number;

    @Prop({ type: String, required: [true, "Add description name"] })
    description:string;


}


export const ExperienceSchema=SchemaFactory.createForClass(Experience);






