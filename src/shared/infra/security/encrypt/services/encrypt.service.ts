import { Result } from '@inpro-labs/core';
import * as crypto from 'crypto';
import { EnvService } from '@config/env/env.service';
import { EncryptService } from '@shared/domain/interfaces/encrypt.service.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptServiceImpl implements EncryptService {
  private readonly secret: string;

  constructor(private readonly config: EnvService) {
    this.secret = this.config.get('REFRESH_TOKEN_HMAC_SECRET');
  }

  generateHmacDigest(payload: string): Result<string> {
    try {
      const hmac = crypto.createHmac('sha256', this.secret);

      const digest = hmac.update(payload).digest('hex');

      return Result.ok(digest);
    } catch (err) {
      return Result.err(err as Error);
    }
  }

  compareHmacDigests(a: string, b: string): Result<boolean> {
    try {
      const bufA = Buffer.from(a, 'hex');
      const bufB = Buffer.from(b, 'hex');

      if (bufA.length !== bufB.length) {
        return Result.ok(false);
      }

      const equal = crypto.timingSafeEqual(bufA, bufB);

      console.log(equal);

      return Result.ok(equal);
    } catch (err) {
      return Result.err(err as Error);
    }
  }
}
