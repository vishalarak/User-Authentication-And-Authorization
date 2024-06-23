import { Module } from '@nestjs/common';
import { UserModule, AuthModule, PostsModule, FileModule } from './models';

@Module({
  imports: [UserModule, AuthModule, PostsModule, FileModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
