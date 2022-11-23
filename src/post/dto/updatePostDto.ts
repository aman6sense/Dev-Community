import { IsNotEmpty } from 'class-validator';

export class UpdatePostDto {
  title: string;
  post: string;
  tags: [string];
}
