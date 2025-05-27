import { Result, Err, ValueObject, Ok } from '@inpro-labs/core';
import { z } from 'zod';

interface EmailChannelDataProps {
  to: string;
}

export class EmailChannelData extends ValueObject<EmailChannelDataProps> {
  static readonly schema = z.object({
    to: z.string().email(),
  });

  private constructor(props: EmailChannelDataProps) {
    super(props);
  }

  static create(props: EmailChannelDataProps): Result<EmailChannelData, Error> {
    if (!EmailChannelData.isValidProps(props)) {
      return Err(new Error('Invalid email channel data'));
    }

    return Ok(new EmailChannelData(props));
  }

  static isValidProps(props: EmailChannelDataProps): boolean {
    return EmailChannelData.schema.safeParse(props).success;
  }
}
