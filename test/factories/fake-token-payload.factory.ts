import { Result } from '@inpro-labs/core';
import { TokenPayload } from '@modules/auth/domain/value-objects/token-payload.value-object';

type TokenPayloadFactoryParams = {
  sid?: string;
  sub?: string;
  email?: string;
  deviceId?: string;
  jti?: string;
};

export class TokenPayloadFactory {
  static make({
    sid = 'session-123',
    sub = 'user-123',
    email = 'test@example.com',
    deviceId = 'device-123',
    jti = 'jti-123',
  }: TokenPayloadFactoryParams = {}): Result<TokenPayload> {
    return TokenPayload.create({
      sid,
      sub,
      email,
      deviceId,
      jti,
    });
  }
}
