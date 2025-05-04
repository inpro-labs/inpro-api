import { Result } from '@inpro-labs/core';
import * as bcrypt from 'bcrypt';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import * as crypto from 'crypto';

export class HashServiceImpl implements HashService {
  async generateHash(payload: string): Promise<Result<string>> {
    try {
      const salt = await bcrypt.genSalt(8);
      const hash = await bcrypt.hash(payload, salt);

      return Result.ok(hash);
    } catch (error) {
      return Result.err(error);
    }
  }

  async compareHash(payload: string, hashed: string): Promise<Result<boolean>> {
    try {
      const isMatch = await bcrypt.compare(payload, hashed);

      return Result.ok(isMatch);
    } catch (error) {
      return Result.err(error);
    }
  }

  generateHmac(payload: string): Result<string> {
    try {
      const hmac = crypto.createHmac('sha256', payload);
      return Result.ok(hmac.digest('hex'));
    } catch (error) {
      return Result.err(error as Error);
    }
  }

  compareHmac(digest: string, digestToCompare: string): Result<boolean> {
    try {
      const isEqual = crypto.timingSafeEqual(
        Buffer.from(digest, 'hex'),
        Buffer.from(digestToCompare, 'hex'),
      );

      return Result.ok(isEqual);
    } catch (error) {
      return Result.err(error as Error);
    }
  }
}
