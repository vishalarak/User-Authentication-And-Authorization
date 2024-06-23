import { Body, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePostDto, file?: Express.Multer.File) {
    try {
      let profilePicture = file.filename;
      const post = await this.prisma.post.create({
        data: {
          post_title: data.post_title,
          description: data.description,
          post_image: profilePicture,
          userId: data.userId,
        },
      });
      return {
        message: 'Post added successfully!',
        status: true,
        data: post,
      };
    } catch (error) {
      console.log(`Error : ${error}`);
    }
  }

  async findAll(page: number, pageSize: number, name: string) {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      const total = await this.prisma.post.count({
        where: { post_title: { contains: name, mode: 'insensitive' } },
      });
      const data = await this.prisma.post.findMany({
        where: { post_title: { contains: name, mode: 'insensitive' } },
        skip,
        take,
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              profile_picture: true,
              role: true,
            },
          },
        },
      });
      if (data) {
        return {
          message: 'Posts fetch successfully!',
          status: true,
          data: data,
          pageNo: page,
          pageSize: pageSize,
          total: total,
        };
      } else {
        return {
          message: 'Posts not found!',
          status: false,
          data: null,
        };
      }
    } catch (error) {
      return `Unexpected error while fetching data: ${error}`;
    }
  }

  async findOne(id: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id: id,
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              profile_picture: true,
              role: true,
            },
          },
        },
      });
      if (post) {
        return {
          message: 'Post fetch successfully!',
          status: true,
          data: post,
        };
      } else {
        return {
          message: 'Post not found!',
          status: false,
          data: null,
        };
      }
    } catch (error) {
      return `Unexpected error while fetching data: ${error}`;
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    file?: Express.Multer.File,
  ) {
    try {
      const post = await this.prisma.post.findFirst({
        where: {
          id: id,
        },
      });
      if (post) {
        let profilePicture = file.filename;
        const updatedPost = await this.prisma.post.update({
          where: { id: id },
          data: {
            post_title: updatePostDto.post_title,
            description: updatePostDto.description,
            post_image: profilePicture,
          },
        });
        return {
          message: 'Post updated successfully!',
          status: true,
          data: updatedPost,
        };
      } else {
        return {
          message: 'Post not found!',
          status: false,
          data: null,
        };
      }
    } catch (error) {
      return `Unexpected error while updating data: ${error}`;
    }
  }

  async remove(id: string) {
    try {
      const post = await this.prisma.post.findFirst({
        where: {
          id: id,
        },
      });
      if (post) {
        const deletedPost = await this.prisma.post.delete({
          where: { id: id },
        });
        return {
          message: 'Post deleted successfully!',
          status: true,
          data: deletedPost,
        };
      } else {
        return {
          message: 'Post not found!',
          status: false,
          data: null,
        };
      }
    } catch (error) {
      return `Unexpected error while updating data: ${error}`;
    }
  }

  async findPost(searchText: string) {
    try {
      const data = await this.prisma.post.findMany({
        where: {
          OR: [
            {
              post_title: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
            {
              user: {
                first_name: {
                  contains: searchText,
                  mode: 'insensitive',
                },
                last_name: {
                  contains: searchText,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              profile_picture: true,
              role: true,
            },
          },
        },
      });
      if (data.length == 0) {
        return {
          message: 'User not found!',
          status: false,
          data: data,
        };
      } else {
        return {
          message: 'Users fetch successfully!',
          status: true,
          data: data,
        };
      }
    } catch (error) {
      return {
        message: 'An error occurred while fetching users.',
        status: false,
        data: null,
      };
    }
  }
}
