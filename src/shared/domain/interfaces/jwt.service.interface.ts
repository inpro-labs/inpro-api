import { Result } from '@inpro-labs/core';
import { TokenPayload } from '../entities/token-payload.entity';

export interface SignOptions {
  expiresIn?: string;
  secret?: string;
}

export interface VerifyOptions {
  secret?: string;
}

export abstract class JwtService {
  abstract sign(payload: TokenPayload, options?: SignOptions): string;
  abstract verify(token: string, options?: VerifyOptions): Result<TokenPayload>;
}
