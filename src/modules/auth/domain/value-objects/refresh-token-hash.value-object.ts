import { Result, ValueObject } from '@inpro-labs/api-sdk';

interface Props {
  value: string;
}

export class RefreshTokenHash extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(hash: string): Result<RefreshTokenHash> {
    return Result.ok(new RefreshTokenHash({ value: hash }));
  }
}
