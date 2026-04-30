import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from 'src/common/constant/app.constant';
import * as jwt from 'jsonwebtoken';

// Đẩy ra những nơi khác nên dùng Injectable
@Injectable()
export class TokenService {
  createAccessToken(userId) {
    if (!userId) {
      throw new BadRequestException('Không có userId để tạo AccessToken');
    }

    // AT = Access Token
    const accessToken = jwt.sign(
      { userId: userId },
      ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '1d',
      },
    );

    return accessToken;
  }

  // RefreshToken
  createRefreshToken(userId) {
    if (!userId) {
      throw new BadRequestException('Không có userId để tạo RefreshToken');
    }

    // RT = Refresh Token
    const refreshToken = jwt.sign(
      { userId: userId },
      REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '1d',
      },
    );

    return refreshToken;
  }

  verifyAccessToken(accessToken, option?: jwt.VerifyOptions) {
    return jwt.verify(accessToken, ACCESS_TOKEN_SECRET as string, option);
  }

  verifyRefreshToken(refreshToken, option?: jwt.VerifyOptions) {
    const decode = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET as string,
      option,
    );
    return decode;
  }
}
