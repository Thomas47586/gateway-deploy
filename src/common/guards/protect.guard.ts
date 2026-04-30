import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { TokenService } from 'src/modules-system/token/token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import e from 'express';

@Injectable()
export class ProtechGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      console.log({ isPublic });
      if (isPublic) {
        // 💡 See this condition
        return true;
      }
      const request = context.switchToHttp().getRequest();

      // Để lấy được cookies bắt buộc phải tích hợp thu viện cookie-parser
      const { accessToken, refreshToken } = request.cookies;

      if (!accessToken) {
        // UnauthorizedException báo lỗi 401 và logout luôn
        throw new UnauthorizedException('Access token not found');
      }

      // Kiểm tra Token xem hợp lý chưa
      const decode = this.tokenService.verifyAccessToken(accessToken);

      // Kiểm tra người dùng có trong db không
      const userExits = await this.prisma.users.findUnique({
        where: {
          id: (decode as any).userId,
        },
      });

      // Nếu access token hợp lý không có thì thông báo User Not found
      if (!userExits) {
        throw new UnauthorizedException('User not found');
      }

      request.user = userExits;

      console.log('ProtechGuard', { cookies: request.cookies });
      return true;
    } catch (error: any) {
      console.log(error);
      switch (error.constructor) {
        case TokenExpiredError:
          throw new ForbiddenException(error.message);
          break;

        default:
          throw new UnauthorizedException('Access token not found');
          break;
      }
    }
  }
}
