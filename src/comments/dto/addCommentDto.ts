import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class AddCommentDto {
  @IsNotEmpty({ message: 'Sect a post first for commenting?' })
  post: mongoose.Types.ObjectId;

  @IsNotEmpty({ message: 'Who owner of this comment?' })
  user: mongoose.Types.ObjectId;

  @IsNotEmpty({ message: 'Add your comment' })
  comment: string;
}
