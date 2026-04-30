import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { loginDto } from './dto/login.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/modules-system/token/token.service';
import { Request } from 'express';
import { TotpService } from '../totp/totp.service';

// Injectable => New đúng một lần service này là sử dụng trong bất cứ controller nào
@Injectable()
export class AuthService {
  // Sử dụng DI, PrismaService đang là global
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private totpService: TotpService,
  ) {}
  async login(body: loginDto) {
    const { email, password, token } = body;

    // Kiểm tra email xem tồn tại chưa
    // Nếu chưa tồn tại => Từ chối kêu người dùng đăng ký
    // Nếu mà tồn tại => đi xử lý tiếp
    const userExits = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
      omit: { password: false },
    });

    if (!userExits) {
      //   throw new BadRequestException("Account Invalid");
      throw new BadRequestException(
        'Người dùng chưa tồn tại, vui lòng đăng ký',
      );
    }

    if (!userExits.password) {
      throw new BadRequestException(
        'Cần đăng nhập bằng Google để cập nhật mật khẩu',
      );
    }

    // Check T-OTP
    if (userExits.totpSecret) {
      if (token) {
        // FE gọi API login lần 2
        const { valid } = await this.totpService.totp.verify(token, {
          secret: userExits.totpSecret,
        });
        if (!valid) {
          throw new BadRequestException('Token khong hop le');
        }
      } else {
        // FE gọi api login lần 1
        return { isTotp: true };
      }
    }

    const isPassword = bcrypt.compareSync(password, userExits.password);

    if (!isPassword) {
      // throw new BadRequestException("Account Invalid.");
      throw new BadRequestException('Mật khẩu không đúng');
    }

    const accessToken = this.tokenService.createAccessToken(userExits.id);
    const refreshToken = this.tokenService.createRefreshToken(userExits.id);

    // console.log({ email, password, userExits, isPassword });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshToken(req: Request) {
    // TOKEN đã xử lý ở middleware Protect
    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken) {
      throw new UnauthorizedException('Access token not found');
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // ignoreExpiration => khong kiem tra het han vì accessToken đang bị hết hạn FE đang muốn làm mới
    // Cho nên không được kiểm tra hạn của accessToken
    const decodeAccessToken: any = this.tokenService.verifyAccessToken(
      accessToken,
      {
        ignoreExpiration: true,
      },
    );
    const decodeRefreshToken: any =
      this.tokenService.verifyRefreshToken(refreshToken);

    if (decodeAccessToken.userId !== decodeRefreshToken.userId) {
      throw new UnauthorizedException('Token invalid..');
    }

    const userExits = await this.prisma.users.findUnique({
      where: {
        id: decodeAccessToken.userId,
      },
    });

    if (!userExits) {
      throw new UnauthorizedException('Không tìm thấy user');
    }
    const accessTokenNew = this.tokenService.createAccessToken(userExits.id);
    const refreshTokenNew = this.tokenService.createRefreshToken(userExits.id);

    return {
      accessToken: accessTokenNew,
      refreshToken: refreshTokenNew,
    };
  }
}
