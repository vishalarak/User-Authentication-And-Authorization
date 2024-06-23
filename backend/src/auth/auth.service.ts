import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/models/user/user.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const passwordMatch = await bcrypt.compare(pass, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload);
      return {
        user: user,
        token: accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred during sign-in',
      );
    }
  }

  async signUp(data: User, file?: Express.Multer.File) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already registered');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      let profilePicture = file ? file.filename : null;

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          city: data.city,
          profile_picture: profilePicture,
        },
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred during sign-up',
      );
    }
  }
}
