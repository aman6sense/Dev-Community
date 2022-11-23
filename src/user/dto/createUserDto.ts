import { IsNotEmpty } from 'class-validator';
import { UserType } from '../model/user.userType.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: "Name can't be empty" })
  readonly name: string;

  @IsNotEmpty({ message: 'Please provide your email' })
  readonly email: string;

  @IsNotEmpty({ message: 'Please provide your password' })
  readonly password: string;

  @IsNotEmpty({ message: 'Please provide your password' })
  userType: UserType;

}
