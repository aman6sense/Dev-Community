import {
  Body, Controller, Delete, Get, Logger, Param, Patch, UseGuards
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { updateUserDto } from './dto/updateUserDto';
import { UserService } from './user.service';

// @UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  private logger = new Logger('Usercontroller');

  constructor(private userService: UserService) { }

  // @Post()
  // async create(@Body() createUserDto: CreateUserDto) {
  //   const result = await this.userService.create(createUserDto);
  //   if (!result) {
  //     this.logger.verbose('User is duplicate');

  //     throw new UnauthorizedException('Email already exist');
  //   }
  //   return result;
  // }
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: updateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
