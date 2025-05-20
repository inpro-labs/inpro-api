import { Result } from '@inpro-labs/core';
import * as bcrypt from 'bcrypt';
import { IHashService } from '../interfaces/hash.service.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashService implements IHashService {
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
}
