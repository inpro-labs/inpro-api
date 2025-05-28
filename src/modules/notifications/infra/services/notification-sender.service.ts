import { INotificationSenderService } from '@modules/notifications/application/ports/out/notification-sender.port';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { Injectable } from '@nestjs/common';
import { MailSenderGateway } from '@shared/gateways/mail/mail-sender.gateway';
import { TemplateManagerService } from './template-manager.service';
import { Err, ID, Ok, Result } from '@inpro-labs/core';

@Injectable()
export class NotificationSenderService implements INotificationSenderService {
  constructor(
    private readonly mailSenderGateway: MailSenderGateway,
    private readonly templateManagerService: TemplateManagerService,
  ) {}

  async send(notification: Notification): Promise<Result> {
    const { channel, template: templateName } = notification.toObject();

    const templateResult = this.templateManagerService.getTemplate(
      ID.create(templateName).unwrap(),
    );

    if (templateResult.isErr()) {
      return Err(templateResult.getErr()!);
    }

    const template = templateResult.unwrap();

    if (channel === NotificationChannel.EMAIL) {
      const channelData = notification
        .getChannelData<NotificationChannel.EMAIL>()
        .unwrap();

      const emailDataResult = template.getChannelData(
        NotificationChannel.EMAIL,
      );

      if (emailDataResult.isErr()) {
        return Err(emailDataResult.getErr()!);
      }

      const emailData = emailDataResult.unwrap();

      const result = await this.mailSenderGateway.sendEmail({
        to: [{ email: channelData.get('to') }],
        subject: emailData.metadata.subject,
        text: template
          .renderContent(
            NotificationChannel.EMAIL,
            notification.get('templateData')!,
          )
          .unwrap(),
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
