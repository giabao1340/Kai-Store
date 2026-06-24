import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Cấu hình cách lấy token và secret key
  constructor(
    private config: ConfigService,// Inject ConfigService để lấy secret key từ env
    private prisma: PrismaService,//  Inject PrismaService để truy vấn user trong validate()
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),// Lấy token từ header Authorization: Bearer <token>
      secretOrKey: config.get<string>('JWT_SECRET', 'fallback_secret'),// Lấy secret key từ env, có fallback nếu không có
    });
  }

  // Hàm này chạy sau khi token hợp lệ
  // payload là data đã được decode từ token
  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({// Tìm user theo id trong payload.sub
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException();// Nếu user không tồn tại, trả về lỗi 401

    // Trả về user (hoặc một phần của user) sẽ được gắn vào request.user
    // Ở đây mình loại bỏ password và refreshToken ra khỏi object user trả về

    // Object này sẽ được gắn vào request.user
    const { password, refreshToken, ...result } = user;
    return user;
  }
}