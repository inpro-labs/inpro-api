import { Err, Ok, ValueObject } from '@inpro-labs/core';

interface Props {
  value: string;
}

export class Email extends ValueObject<Props> {
  constructor(props: Props) {
    super(props);
  }

  static create(value: string) {
    if (!this.isValid(value)) {
      return Err(new Error('Invalid email'));
    }

    return Ok(new Email({ value }));
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }
}
