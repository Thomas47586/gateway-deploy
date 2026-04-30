// Class là phải ghi hoa chữ cái đầu tiên

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModule } from 'src/modules-system/token/token.module';
import { TotpModule } from '../totp/totp.module';

// TS bọc JS => Lúc chạy thì máy chỉ chạy JS, TS chỉ giúp lúc dev
// @ chính là decorator => Gắn các dữ liệu metadata vào
@Module({
  imports: [TokenModule, TotpModule],

  controllers: [AuthController],

  // Provider có nhiệm vụ là new 1 lần trong lúc chạy => Nó là DI
  providers: [AuthService],
})
export class AuthModule {}
