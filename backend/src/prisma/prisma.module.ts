import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // Global để không cần import lại ở từng module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}