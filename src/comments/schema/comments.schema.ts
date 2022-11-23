import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CommentsDoc = Comments & Document;

@Schema()
export class Comments {
  @Prop({ type: mongoose.Types.ObjectId, required: [true, 'Select a post'] })
  post: string;

  @Prop({ type: mongoose.Types.ObjectId, required: [true, 'Please Login'] })
  user: string;

  @Prop({ type: String, required: [true, 'Please add some comments'] })
  comment: string;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
