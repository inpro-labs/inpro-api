import { Result } from '@inpro-labs/core';

export abstract class HashService {
  abstract generateHash(payload: string): Promise<Result<string>>;
  abstract compareHash(
    payload: string,
    hashed: string,
  ): Promise<Result<boolean>>;
  abstract generateHmac(payload: string): Result<string>;
  abstract compareHmac(payload: string, hmac: string): Result<boolean>;
}
