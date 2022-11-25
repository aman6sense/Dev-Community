import { IsNotEmpty } from 'class-validator';
import { UserType } from '../model/user.userType.enum';

export class updateUserDto {
  @IsNotEmpty({ message: "Name can't be empty" })
  readonly name: string;

  @IsNotEmpty({ message: 'Please provide your UserType' })
  userType: UserType;

  refreshToken: string;
}
