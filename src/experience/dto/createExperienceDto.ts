import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { IsNotEmpty } from 'class-validator';

export class CreateExperienceDto {
  @IsNotEmpty({ message: 'Select a developer(User)' })
  developer: mongoose.Types.ObjectId;

  @IsNotEmpty({ message: 'Select company name' })
  CompanyName: string;

  @IsNotEmpty({ message: 'Add duration of experience' })
  duration: number;

  @IsNotEmpty({ message: 'Add your experience description' })
  description: string;
}
