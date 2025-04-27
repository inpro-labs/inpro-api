import { Result } from '@inpro-labs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { TokenPayload } from '@shared/domain/entities/token-payload.entity';
import {
  JwtService,
  SignOptions,
  VerifyOptions,
} from '@shared/domain/interfaces/jwt.service.interface';

export class JwtServiceImpl implements JwtService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: NestJwtService,
  ) {}

  sign(payload: TokenPayload, options?: SignOptions): string {
    return this.jwtService.sign(payload.toObject(), {
      secret: this.configService.get('JWT_SECRET'),
      ...options,
    });
  }

  verify(token: string, options?: VerifyOptions): Result<TokenPayload> {
    const decoded = this.jwtService.verify<{
      sid: string;
      sub: string;
      email: string;
    }>(token, {
      secret: this.configService.get('JWT_SECRET'),
      ...options,
    });

    return TokenPayload.create({
      sid: decoded.sid,
      sub: decoded.sub,
      email: decoded.email,
    });
  }
}
