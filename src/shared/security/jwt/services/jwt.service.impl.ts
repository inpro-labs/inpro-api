import { Result } from '@inpro-labs/core';
import { TokenPayload } from '@modules/auth/domain/value-objects/token-payload.value-object';
import {
  IJwtService,
  SignOptions,
  VerifyOptions,
} from '../interfaces/jwt.service.interface';
import { EnvService } from '@config/env/env.service';
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService implements IJwtService {
  private readonly secret: string;

  constructor(
    private readonly config: EnvService,
    private readonly jwtService: NestJwtService,
  ) {
    this.secret = this.config.get('JWT_SECRET');
  }

  sign(payload: TokenPayload, options?: SignOptions): string {
    const data = payload.toObject();

    return this.jwtService.sign(data, {
      expiresIn: options?.expiresIn,
      secret: options?.secret ?? this.secret,
    });
  }

  verify(token: string, options?: VerifyOptions): Result<TokenPayload> {
    try {
      const decoded = this.jwtService.verify<Record<string, string>>(token, {
        secret: options?.secret ?? this.secret,
      });

      return TokenPayload.create({
        sid: decoded.sid,
        sub: decoded.sub,
        email: decoded.email,
        deviceId: decoded.deviceId,
        jti: decoded.jti,
      });
    } catch (error) {
      return Result.err(error as Error);
    }
  }
}
