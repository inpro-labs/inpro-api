import { Result } from '@inpro-labs/core';
import { TokenPayload } from '@modules/auth/domain/value-objects/token-payload.value-object';

export interface SignOptions {
  expiresIn?: string;
  secret?: string;
}

export interface VerifyOptions {
  secret?: string;
}

export abstract class IJwtService {
  abstract sign(payload: TokenPayload, options?: SignOptions): string;
  abstract verify(token: string, options?: VerifyOptions): Result<TokenPayload>;
}
