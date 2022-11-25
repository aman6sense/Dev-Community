import { IsNotEmpty } from 'class-validator';

export class UpdateExperienceDto {
  
  @IsNotEmpty({ message: 'Select company name' })
  CompanyName: string;

  @IsNotEmpty({ message: 'Add duration of experience' })
  duration: number;

  @IsNotEmpty({ message: 'Add your experience description' })
  description: string;
}
