import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Đăng ký ──────────────────────────────────────
  async register(dto: RegisterDto) {
    // 1. Kiểm tra email đã tồn tại chưa
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email đã được sử dụng');

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Tạo user mới
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
      },
    });

    // 4. Trả về token luôn (không cần đăng nhập lại)
    return this.generateTokens(user.id, user.email);
  }

  // ── Đăng nhập ─────────────────────────────────────
  async login(dto: LoginDto) {
    // 1. Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    // 2. So sánh password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    // 3. Trả về token
    return this.generateTokens(user.id, user.email);
  }

  // ── Helper: Tạo Access Token + Refresh Token ───────
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m', // Access token hết hạn sau 15 phút
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d', // Refresh token hết hạn sau 7 ngày
    });

    // Lưu refresh token vào DB
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      // 1. Verify refresh token
      const payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'fallback'),
      });

      // 2. Tìm user và kiểm tra refresh token khớp trong DB
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== dto.refreshToken) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      // 3. Cấp token mới
      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }
}