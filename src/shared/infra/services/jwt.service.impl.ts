import { Err, Result } from '@inpro-labs/core';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { TokenPayload } from '@shared/domain/value-objects/token-payload.entity';
import {
  JwtService,
  SignOptions,
  VerifyOptions,
} from '@shared/domain/interfaces/jwt.service.interface';
import { EnvService } from '@config/env/env.service';

export class JwtServiceImpl implements JwtService {
  constructor(
    private readonly envService: EnvService,
    private readonly jwtService: NestJwtService,
  ) {}

  sign(payload: TokenPayload, options?: SignOptions): string {
    return this.jwtService.sign(payload.toObject(), {
      secret: this.envService.get('JWT_SECRET'),
      ...options,
    });
  }

  verify(token: string, options?: VerifyOptions): Result<TokenPayload> {
    try {
      const decoded = this.jwtService.verify<{
        sid: string;
        sub: string;
        email: string;
        deviceId: string;
        jti: string;
      }>(token, {
        secret: this.envService.get('JWT_SECRET'),
        ...options,
      });

      return TokenPayload.create({
        sid: decoded.sid,
        sub: decoded.sub,
        email: decoded.email,
        deviceId: decoded.deviceId,
        jti: decoded.jti,
      });
    } catch (error) {
      return Err(
        new Error(error instanceof Error ? error.message : 'Invalid token'),
      );
    }
  }
}
