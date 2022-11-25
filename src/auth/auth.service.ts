import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import jwt_decode from "jwt-decode";
import { CreateUserDto } from 'src/user/dto/createUserDto';
import { UserService } from 'src/user/user.service';
import { AuthCredentialsDto } from './dto/authCredentialsDto';

import { ElasticSearchHelper, IndexNames } from 'src/helper/elastic.search.helper';
import { UserType } from 'src/user/model/user.userType.enum';

@Injectable()
export class AuthService {

  private logger = new Logger("AuthServiceLogger");
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async signUp(createUserDto: CreateUserDto) {

    // Check if user exists
    const userExists = await this.userService.findByEmail(createUserDto.email);

    if (userExists) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password);

    const createUserData = {
      name: createUserDto.name ? createUserDto.name : "",
      email: createUserDto.email ? createUserDto.email : "",
      password: hash,
      userType: createUserDto.userType
        ? createUserDto.userType
        : UserType.BACKEND,

    };
    const user = await this.userService.create(createUserData);
    const newUser = user.toObject();

    // push user into ElasticSearch
    if (newUser) {

      const res = await ElasticSearchHelper.index(IndexNames.users, newUser);
      if (!res) {

        this.logger.log("Error to push user into ElasticSearch!")
      }
    }

    const tokens = await this.getTokens(newUser._id, newUser.email);

    delete newUser.password;

    return {
      user: newUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto) {

    const signInUser = {
      email: authCredentialsDto.email ? authCredentialsDto.email : "",
      password: authCredentialsDto.password ? authCredentialsDto.password : "",
    }

    const existsUser = await this.userService.findByEmail(signInUser.email);


    if (existsUser && (await bcrypt.compare(signInUser.password, existsUser.password))) {

      const tokens = await this.getTokens(existsUser._id, existsUser.email);

      // await this.updateRefreshToken(existsUser._id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };

    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  // async logout(userId: string) {
  //   return this.userService.updateRefreshToken(userId, null);
  // }




  async refreshTokens(user: any, refreshToken: any) {


    const decoded = await jwt_decode(refreshToken?.refreshToken);

    const bodyEmail = user?.email;
    const decodedEmail = decoded['email'];


    this.logger.log("bodyEmail", bodyEmail)
    this.logger.log("decodedEmail", decodedEmail)

    const existUser = await this.userService.findByEmail(decodedEmail);

    if (bodyEmail == decodedEmail && existUser) {
      const tokens = await this.getTokens(existUser._id, existUser.email);

      return {
        accessToken: tokens.accessToken,
        refreshTokens: tokens.refreshToken
      }
    }

    else {
      throw new ForbiddenException('Access Denied1');
    }

  }


  async hashData(data: string) {
    // return argon2.hash(data);
    return await bcrypt.hash(data, 10);
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([

      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('secret'),
          expiresIn: '1d',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('secret'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // async updateRefreshToken(userId: string, refreshToken: string) {
  //   const hashedRefreshToken = await this.hashData(refreshToken);
  //   await this.userService.updateRefreshToken(userId, hashedRefreshToken);
  // }
}
