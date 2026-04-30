import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { TokenService } from 'src/modules-system/token/token.service';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.getAllAndOverride<boolean>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Tìm ra người đang gọi API này thì có thể lấy req.user ở guard protect
    // Khi có user rồi thì lấy key role (cột role trong db)
    // So sánh role của user (DB) ===. role (decorator)
    // Nếu không === thì trả false
    // Nếu bằng === thì trả true
    console.log('RoleGuard', { role });
    return true;
  }
}
