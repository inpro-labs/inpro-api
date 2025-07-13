import { Ok, Result, ValueObject } from '@inpro-labs/core';
import { EmailChannelData } from './email-channel-data.value-object';
import { SmsChannelData } from './sms-channel-data.value-object';
import { NotificationChannel } from '../enums/notification-channel.enum';

interface EmailChannel {
  type: NotificationChannel.EMAIL;
  data: EmailChannelData;
}

interface SmsChannel {
  type: NotificationChannel.SMS;
  data: SmsChannelData;
}

type Props = EmailChannel | SmsChannel;

export class Channel extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): Result<Channel, Error> {
    return Ok(new Channel(props));
  }
}
