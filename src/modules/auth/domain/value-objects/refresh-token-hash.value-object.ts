import { Result, ValueObject } from '@inpro-labs/core';

interface Props {
  value: string;
}

export class RefreshTokenDigest extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(hash: string): Result<RefreshTokenDigest> {
    return Result.ok(new RefreshTokenDigest({ value: hash }));
  }
}
