import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Who owner of this post?' })
  userId: mongoose.Types.ObjectId;

  @IsNotEmpty({ message: 'Set some titles' })
  title: string;

  @IsNotEmpty({ message: "Post can't be empty" })
  post: string;
}
