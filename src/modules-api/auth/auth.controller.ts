// Controller xử lý cả router

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { Role } from 'src/common/decorators/role.decorator';

// auth => là router /auth. NestJS tự nhận dạng /
@Controller('auth')
export class AuthController {
  // Cách sử dụng DI
  // Private là một biến, còn nhiều tên biến khác như public, protected. Mỗi cái có chức năng khác nhau
  // AuthService chính là type của class
  constructor(private authService: AuthService) {}

  // Tạo phương thức giống như function
  // Lúc này là localhost:3069/auth/login
  @Post('login')
  // Set metadata - Một dữ liệu nho nhỏ đi kèm với log in
  @Public()
  //   @Role('ADMIN')
  async login(
    // Muốn nhận Body thì dùng @ gọi đến hàm body bằng decorator
    @Body()
    body: loginDto,
    // @Query()
    // query: any,
    // @Param()
    // param: any,

    // Lấy response
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.authService.login(body);

    // Xử lý TOTP
    if (result.isTotp) {
      return { isTotp: true };
    } else {
      res.cookie('accessToken', result.accessToken);
      res.cookie('refreshToken', result.refreshToken);

      return true;
    }
  }

  @Get('get-info')
  @Role('USER')
  getInfo(@User() user) {
    // user.isTotp = !!user.totpSecret; // !! chuyển sang boolean
    if (user.totpSecret) {
      user.isTotp = true;
    }
    delete user.password;
    delete user.totpSecret;

    return user;
  }

  // Refresh token chạy khi access token bị hết hạn => Nếu không public thì guard chạy vào và kiểm tra không cho truy cập API này
  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Req()
    req: Request,
    @Res({ passthrough: true }) // passthrough Sử dụng hệ thống trả về của NestJS
    res: Response,
  ) {
    const result = await this.authService.refreshToken(req);
    res.cookie('accessToken', result.accessToken);
    res.cookie('refreshToken', result.refreshToken);
    return true;
  }
}
