import { Body, Controller, Post } from '@nestjs/common';
import { TotpService } from './totp.service';
import { User } from 'src/common/decorators/user.decorator';
import type { Users } from 'src/modules-system/prisma/generated/prisma/client';
import { SaveTotpDto } from './dto/save-totp.dto';
import { DisableTotpDto } from './dto/disable-totp.dto';

@Controller('totp')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  // Generate: Tạo secret key => QR => Đẩy cho FE
  @Post('generate')

  // Call decorator @USER => Đặt tên biến là user => Import Users làm type
  generate(@User() user: Users) {
    return this.totpService.generate(user);
  }

  // Save secret key => Luu vao DB
  @Post('save')
  save(@User() user: Users, @Body() body: SaveTotpDto) {
    return this.totpService.save(user, body);
  }

  // Disbale secret key => Xoa DB
  @Post('disable')
  disable(@User() user: Users, @Body() body: DisableTotpDto) {
    return this.totpService.disable(user, body);
  }
}
