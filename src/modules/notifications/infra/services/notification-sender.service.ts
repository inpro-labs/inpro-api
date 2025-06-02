import { INotificationSenderService } from '@modules/notifications/application/ports/out/notification-sender.port';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { Injectable } from '@nestjs/common';
import { MailSenderGateway } from '@shared/gateways/mail/mail-sender.gateway';
import { TemplateManagerService } from './template-manager.service';
import { Err, Ok, Result } from '@inpro-labs/core';
import * as Mustache from 'mustache';
import { EmailChannelData } from '@modules/notifications/domain/value-objects/email-channel-data.value-object';

@Injectable()
export class NotificationSenderService implements INotificationSenderService {
  constructor(
    private readonly mailSenderGateway: MailSenderGateway,
    private readonly templateManagerService: TemplateManagerService,
  ) {}

  async send(
    notification: Notification,
    templateVariables: Record<string, unknown>,
  ): Promise<Result> {
    const { channel } = notification.toObject();
    const template = notification.get('template');

    const templateExists = this.templateManagerService.getTemplate(
      template.id.value(),
    );

    if (templateExists.isErr()) {
      return Err(templateExists.getErr()!);
    }

    if (channel === NotificationChannel.EMAIL) {
      const channelData = notification
        .getChannelData()
        .unwrap() as EmailChannelData;

      const emailDataResult = template.getChannel(NotificationChannel.EMAIL);

      if (emailDataResult.isErr()) {
        return Err(emailDataResult.getErr()!);
      }

      const emailData = emailDataResult.unwrap();

      const result = await this.mailSenderGateway.sendEmail({
        to: [{ email: channelData.get('to') }],
        subject: Mustache.render(emailData.metadata.subject, templateVariables),
        text: Mustache.render(emailData.metadata.body, templateVariables),
      });

      if (result.isErr()) {
        return Err(result.getErr()!);
      }

      return Ok(undefined);
    }

    if (channel === NotificationChannel.SMS) {
      return Ok(undefined);
    }

    return Err(new Error('Invalid notification channel'));
  }
}
