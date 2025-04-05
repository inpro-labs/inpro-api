import { Result } from '@sputnik-labs/api-sdk';

export abstract class HashService {
  abstract generateHash(payload: string): Promise<Result<string>>;
  abstract compareHash(
    payload: string,
    hashed: string,
  ): Promise<Result<boolean>>;
}
