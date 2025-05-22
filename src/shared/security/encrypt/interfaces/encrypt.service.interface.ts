import { Result } from '@inpro-labs/core';

export abstract class IEncryptService {
  abstract generateHmacDigest(payload: string): Result<string>;
  abstract compareHmacDigests(a: string, b: string): Result<boolean>;
}
