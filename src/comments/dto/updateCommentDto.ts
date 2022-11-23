import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class UpdateCommentDto {
  @IsNotEmpty({ message: 'Add update comment' })
  comment: string;
}
