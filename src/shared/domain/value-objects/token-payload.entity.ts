import { Ok, Result, ValueObject } from '@inpro-labs/core';

interface Props {
  sid: string;
  sub: string;
  email: string;
  deviceId: string;
  jti: string;
}

export class TokenPayload extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): Result<TokenPayload> {
    return Ok(new TokenPayload(props));
  }
}
