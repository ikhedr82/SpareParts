import { Module } from '@nestjs/common';
import { PublicInfoService } from './public-info.service';
import { PublicInfoController } from './public-info.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PublicInfoController],
  providers: [PublicInfoService, PrismaService],
  exports: [PublicInfoService],
})
export class PublicInfoModule {}
