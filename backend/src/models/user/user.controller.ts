import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('get-all-users')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('name') name: string,
  ) {
    return this.userService.getAllUsers(+page, +pageSize, name);
  }

  @Post('add')
  @UseInterceptors(
    FileInterceptor('profile_picture', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async addUser(@Body() data: User, @UploadedFile() file: Express.Multer.File) {
    return this.userService.addUser(data, file);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:email')
  async deleteUser(@Param('email') email: string) {
    return this.userService.deleteUser(email);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('profile_picture', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @Patch('edit/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.updateUser(id, data, file);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('search')
  async findUser(@Body('searchText') searchText: string) {
    return this.userService.findUser(searchText);
  }
}
