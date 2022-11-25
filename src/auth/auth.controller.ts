import {
  Body,
  Controller, Logger, Post, UseGuards
} from '@nestjs/common';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { GetUser } from 'src/decorators/getUser.decorator';
import { CreateUserDto } from 'src/user/dto/createUserDto';
import { User } from 'src/user/schema/user.schema';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';




@Controller('auth')
export class AuthController {
  private logger = new Logger("authControllerLogger");

  constructor(private authService: AuthService) { }

  @Post('signUp')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('signIn')
  signIn(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  // @UseGuards(AccessTokenGuard)
  // @Get('logout')
  // logout(@Req() req: Request) {

  //   this.logger.verbose(req.user);

  //   this.authService.logout(req.user['sub']);
  // }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(@GetUser() user: User, @Body() refreshToken: any) {

    return this.authService.refreshTokens(user, refreshToken)

  }

  // @UseGuards(RefreshTokenGuard)
  // @Get('refresh')
  // refreshTokens(@Req() req: Request) {

  //   this.logger.verbose("req user: ", req?.user);

  //   const userId = req.user['_id'];
  //   const email = req.user['email'];

  //   this.logger.verbose('userId: ', userId);
  //   this.logger.verbose('userEmail: ', email);

  //   return this.authService.refreshTokens(userId,
  //     email,
  //   );
  // }
}
