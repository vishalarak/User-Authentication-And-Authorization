import { PrismaService } from 'src/prisma.service';
import { User } from './user.model';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Workbook } from 'exceljs';
import * as tmp from 'tmp';
import path from 'path';
import * as fs from 'fs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getAllUsers(page: number, pageSize: number, name: string) {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      const total = await this.prisma.user.count();
      const users = await this.prisma.user.findMany({
        where: { first_name: name },
        skip,
        take,
      });

      return {
        message: users.length
          ? 'Users fetched successfully.'
          : 'Users not found.',
        status: !!users.length,
        data: users,
        pageNo: page,
        pageSize: pageSize,
        total: total,
      };
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`);
      throw new HttpException(
        'Error fetching users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUser(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: id } });
      if (!user) {
        throw new NotFoundException('User not found!');
      }
      return {
        message: 'User found successfully!',
        status: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Error fetching user: ${error.message}`);
      throw new HttpException(
        'Error fetching user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addUser(data: User, file?: Express.Multer.File) {
    try {
      const isUser = await this.prisma.user.findFirst({
        where: { email: data.email },
      });

      if (isUser) {
        return {
          message: 'User already registered!',
          status: false,
          data: null,
        };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const profilePicture = file ? file.filename : null;
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          city: data.city,
          password: hashedPassword,
          profile_picture: profilePicture,
        },
      });
      return {
        message: 'User created successfully!',
        status: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(id: string, data: User, file?: Express.Multer.File) {
    try {
      const isUser = await this.prisma.user.findUnique({ where: { id: id } });
      if (!isUser) {
        return {
          message: 'User not found!',
          status: false,
          data: null,
        };
      }

      const updatedData: any = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        city: data.city,
        role: data.role,
      };

      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        updatedData.password = hashedPassword;
      }
      if (file) {
        updatedData.profile_picture = file.filename;
      }

      const updateUser = await this.prisma.user.update({
        where: { id: id },
        data: updatedData,
      });

      return {
        message: 'User updated successfully!',
        status: true,
        data: updateUser,
      };
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      throw new HttpException(
        'Error updating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(email: string) {
    try {
      const isUser = await this.prisma.user.findFirst({
        where: { email: email },
      });

      if (!isUser) {
        return {
          message: 'User not found!',
          status: false,
          data: null,
        };
      }

      const user = await this.prisma.user.delete({ where: { email: email } });
      return {
        message: 'User deleted successfully!',
        status: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw new HttpException(
        'Error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchUser(name?: string, email?: string) {
    try {
      const where: any = {};
      if (name) {
        where.first_name = { contains: name, mode: 'insensitive' };
      }
      if (email) {
        where.email = { contains: email, mode: 'insensitive' };
      }
      return await this.prisma.user.findMany({ where });
    } catch (error) {
      this.logger.error(`Error searching users: ${error.message}`);
      throw new HttpException(
        'Error searching users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUser(searchText: string) {
    try {
      const data = await this.prisma.user.findMany({
        where: {
          OR: [
            { first_name: { contains: searchText, mode: 'insensitive' } },
            { last_name: { contains: searchText, mode: 'insensitive' } },
            { email: { contains: searchText, mode: 'insensitive' } },
            { city: { contains: searchText, mode: 'insensitive' } },
          ],
        },
      });
      return {
        message: data.length
          ? 'Users fetched successfully!'
          : 'User not found!',
        status: !!data.length,
        data: data,
      };
    } catch (error) {
      this.logger.error(`Error finding user: ${error.message}`);
      throw new HttpException(
        'Error finding user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
