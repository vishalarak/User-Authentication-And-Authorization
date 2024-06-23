import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { User } from 'src/models/user/user.model';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(@Body() data: User, @Res() res: Response) {
    try {
      const response = await this.authService.signIn(data.email, data.password);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login successfully',
        token_type: 'bearer',
        token: response.token,
        user: response.user,
      });
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  @Post('signup')
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
  async signUp(@Body() data: User, @UploadedFile() file: Express.Multer.File) {
    return this.authService.signUp(data, file);
  }
}
