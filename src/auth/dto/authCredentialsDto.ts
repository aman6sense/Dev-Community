import { IsNotEmpty } from 'class-validator';

export class AuthCredentialsDto {
  @IsNotEmpty({ message: 'User email is empty' })
  email: string;
  @IsNotEmpty({ message: 'User password is empty' })
  password: string;
}
