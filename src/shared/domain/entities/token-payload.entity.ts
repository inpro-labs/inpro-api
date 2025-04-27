import { Entity, Ok, Result } from '@inpro-labs/core';

interface Props {
  sid: string;
  sub: string;
  email: string;
}

export class TokenPayload extends Entity<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): Result<TokenPayload> {
    return Ok(new TokenPayload(props));
  }
}
