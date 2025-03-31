import { Result, ValueObject } from 'types-ddd';

interface Props {
  value: string;
}

export class RefreshTokenHash extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(hash: string) {
    return Result.Ok(new RefreshTokenHash({ value: hash }));
  }
}
