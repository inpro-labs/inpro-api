import { Result } from '@inpro-labs/core';
import { TokenPayload } from '@shared/domain/value-objects/token-payload.entity';

type TokenPayloadFactoryParams = {
  deviceId?: string;
  email?: string;
  jti?: string;
  sid?: string;
  sub?: string;
};

export class TokenPayloadFactory {
  static make({
    deviceId,
    email,
    jti,
    sid,
    sub,
  }: TokenPayloadFactoryParams = {}): Result<TokenPayload> {
    return TokenPayload.create({
      deviceId: deviceId ?? 'device-id',
      email: email ?? 'test@test.com',
      jti: jti ?? 'jti',
      sid: sid ?? 'sid',
      sub: sub ?? 'user-id',
    });
  }
}
