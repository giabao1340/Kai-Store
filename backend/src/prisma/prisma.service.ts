import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to the database successfully');
    } catch (error) {
      console.error('❌ Failed to connect to the database:', error);
    }
  }
}