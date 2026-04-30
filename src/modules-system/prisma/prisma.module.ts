import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Cờ Global sử dụng cho nhiều nơi => Không cần import nữa mà chỉ việc sử dụng thôi
@Global()
@Module({
  providers: [PrismaService],
  // Mang qua module khác sử dụng service này
  exports: [PrismaService],
})
export class PrismaModule {}
