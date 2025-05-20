import { Err, Ok, Result, ValueObject } from '@inpro-labs/core';
import { z } from 'zod';

interface Props {
  sid: string;
  sub: string;
  email: string;
  deviceId: string;
  jti: string;
}

export class TokenPayload extends ValueObject<Props> {
  static readonly schema = z.object({
    sid: z.string(),
    sub: z.string(),
    email: z.string(),
    deviceId: z.string(),
    jti: z.string(),
  });

  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): Result<TokenPayload, Error> {
    const isValid = this.isValidProps(props);

    if (isValid.isErr()) {
      return Err(new Error('Invalid token payload'));
    }

    return Ok(new TokenPayload(props));
  }

  static isValidProps(props: Props): Result<boolean> {
    return Ok(this.schema.safeParse(props).success);
  }
}
