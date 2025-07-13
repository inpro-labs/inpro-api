import { Err, Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationSenderStrategy } from '@modules/notifications/domain/services/notification-sender-strategy.service';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { MailSenderGateway } from '@shared/gateways/mail/mail-sender.gateway';
import { EmailChannelData } from '@modules/notifications/domain/value-objects/email-channel-data.value-object';
import * as Mustache from 'mustache';

@Injectable()
export class EmailNotificationSenderStrategy
  implements NotificationSenderStrategy
{
  constructor(private readonly mailSenderGateway: MailSenderGateway) {}

  supports(channel: NotificationChannel): boolean {
    return channel === NotificationChannel.EMAIL;
  }

  async send(
    notification: Notification,
    variables: Record<string, unknown>,
  ): Promise<Result<void, Error>> {
    const channelData = (
      notification.get('channel').get('data') as EmailChannelData
    ).toObject();

    const template = notification.get('template');

    const emailDataResult = template.getChannel(NotificationChannel.EMAIL);

    if (emailDataResult.isErr()) {
      return Err(emailDataResult.getErr()!);
    }

    const emailData = emailDataResult.unwrap();

    const result = await this.mailSenderGateway.sendEmail({
      to: [{ email: channelData.to }],
      subject: Mustache.render(emailData.metadata.subject, variables),
      text: Mustache.render(emailData.metadata.body, variables),
    });

    if (result.isErr()) {
      return Err(result.getErr()!);
    }

    return Ok(undefined);
  }
}
