import { Module } from '@nestjs/common';
import { TokenService } from './token.service';

@Module({
  // Lúc này NestJS tự new một cái TokenService thông qua provider
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
