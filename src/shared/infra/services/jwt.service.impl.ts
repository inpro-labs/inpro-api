import { Result } from '@inpro-labs/core';
import { TokenPayload } from '@modules/auth/domain/value-objects/token-payload.entity';
import {
  JwtService,
  SignOptions,
  VerifyOptions,
} from '@shared/domain/interfaces/jwt.service.interface';
import { EnvService } from '@config/env/env.service';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtServiceImpl implements JwtService {
  private readonly secret: string;

  constructor(private readonly config: EnvService) {
    this.secret = this.config.get('JWT_SECRET');
  }

  sign(payload: TokenPayload, options?: SignOptions): string {
    return jwt.sign(payload.toObject(), options?.secret ?? this.secret, {
      expiresIn: options?.expiresIn,
    });
  }

  verify(token: string, options?: VerifyOptions): Result<TokenPayload> {
    try {
      const decoded = jwt.verify(
        token,
        options?.secret ?? this.secret,
      ) as Record<string, string>;

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
