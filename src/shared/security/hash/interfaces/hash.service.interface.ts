import { Result } from '@inpro-labs/core';

export abstract class IHashService {
  abstract generateHash(payload: string): Promise<Result<string>>;
  abstract compareHash(
    payload: string,
    hashed: string,
  ): Promise<Result<boolean>>;
}
