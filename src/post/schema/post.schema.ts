import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({timestamps:true})
export class Post {
  @Prop({ type: mongoose.Types.ObjectId, required: [true, 'Select a user id'] })
  userId: string;

  @Prop({ type: String, required: [true, 'Set a post title'] })
  title: string;

  @Prop({ type: String, required: [true, "Write what's on your mind!"] })
  post: string;

  @Prop({ type: [String], required: [true, 'Tags'] })
  tags: [string];
}

export const PostSchema = SchemaFactory.createForClass(Post);
