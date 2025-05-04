import { Result } from '@inpro-labs/core';

export abstract class EncryptService {
  abstract generateHmacDigest(payload: string): Result<string>;
  abstract compareHmacDigests(a: string, b: string): Result<boolean>;
}
