import { BadRequestException, Injectable } from '@nestjs/common';
import { TOTP } from 'otplib';
import { NodeCryptoPlugin } from '@otplib/plugin-crypto-node';
import { ScureBase32Plugin } from '@otplib/plugin-base32-scure';
import { Users } from 'src/modules-system/prisma/generated/prisma/client';
import * as qrcode from 'qrcode';
import { SaveTotpDto } from './dto/save-totp.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { DisableTotpDto } from './dto/disable-totp.dto';

// Nếu trường hợp tài khoản của người dùng đăng nhập trên thiết bị khác thì tự động xoá secret và reset
@Injectable()
export class TotpService {
  public totp: TOTP;
  constructor(private prisma: PrismaService) {
    this.totp = new TOTP({
      crypto: new NodeCryptoPlugin(),
      base32: new ScureBase32Plugin(),
    });
  }
  async generate(user: Users) {
    if (user.totpSecret) {
      throw new Error('User has already generated a TOTP secret');
    }

    const secret = this.totp.generateSecret();

    const uri = this.totp.toURI({
      issuer: 'Node_54',
      secret: secret,
      label: user.email ?? '',
    });

    const qrCode = await qrcode.toDataURL(uri);

    return { secret, uri, qrCode };
  }

  async save(user: Users, body: SaveTotpDto) {
    if (user.totpSecret) {
      throw new Error('User has already generated a TOTP secret');
    }

    const { valid } = await this.totp.verify(body.token, {
      secret: body.secret,
    });

    if (!valid) {
      throw new BadRequestException('Token khong hop le');
    }

    await this.prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        totpSecret: body.secret,
      },
    });
    const userId = user.id;
    const userSecret = body.secret;
    console.log({ userId, userSecret });
    return true;
  }

  async disable(user: Users, body: DisableTotpDto) {
    if (!user.totpSecret) {
      throw new Error('User has no generated a TOTP secret');
    }

    const { valid } = await this.totp.verify(body.token, {
      secret: user.totpSecret,
    });

    if (!valid) {
      throw new BadRequestException('Token khong hop le');
    }

    await this.prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        totpSecret: null,
      },
    });
    return true;
  }
}
