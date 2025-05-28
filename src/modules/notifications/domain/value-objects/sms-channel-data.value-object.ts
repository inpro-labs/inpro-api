import { Result, Err, ValueObject, Ok } from '@inpro-labs/core';
import { z } from 'zod';

interface SmsChannelDataProps {
  phone: string;
}

export class SmsChannelData extends ValueObject<SmsChannelDataProps> {
  static readonly schema = z.object({
    phone: z.string().min(10).max(15),
  });

  private constructor(props: SmsChannelDataProps) {
    super(props);
  }

  static create(props: SmsChannelDataProps): Result<SmsChannelData, Error> {
    if (!SmsChannelData.isValidProps(props)) {
      return Err(new Error('Invalid SMS channel data'));
    }

    return Ok(new SmsChannelData(props));
  }

  static isValidProps(props: SmsChannelDataProps): boolean {
    return SmsChannelData.schema.safeParse(props).success;
  }
}
