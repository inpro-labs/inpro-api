import { Injectable } from '@nestjs/common';
import { Err, Ok, Result, ID } from '@inpro-labs/core';
import { SendNotificationInputDTO } from '../ports/in/send-notification.port';
import { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { Notification } from '../../domain/aggregates/notification.aggregate';
import { EmailChannelData } from '../../domain/value-objects/email-channel-data.value-object';
import { SmsChannelData } from '../../domain/value-objects/sms-channel-data.value-object';
import { PlaceholderSensitivity } from '../../domain/enums/placeholder-sensitivity.enum';

@Injectable()
export class CreateNotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(
    dto: SendNotificationInputDTO,
  ): Promise<Result<Notification, Error>> {
    const { userId, templateId, templateVariables, channel, channelData } = dto;

    if (!Object.values(NotificationChannel).includes(channel)) {
      return Err(new Error('INVALID_NOTIFICATION_CHANNEL'));
    }

    const templateResult = this.notificationRepository.getNotificationTemplate(
      templateId,
    );

    if (templateResult.isErr()) {
      return Err(new Error('NOTIFICATION_TEMPLATE_NOT_FOUND'));
    }

    const template = templateResult.unwrap();

    if (!template.isChannelAvailable(channel)) {
      return Err(new Error('NOTIFICATION_CHANNEL_NOT_AVAILABLE'));
    }

    const redactedTemplateVariables = {
      ...templateVariables,
      ...template
        .getChannel(channel)
        .unwrap()
        .placeholders.reduce((acc, field) => {
          const isSecure =
            field.get('sensitivity') === PlaceholderSensitivity.SECURE;
          if (isSecure) {
            acc[field.get('name')] = '**redacted**';
          }
          return acc;
        }, {} as Record<string, string>),
    };

    let notificationResult: Result<Notification, Error>;

    if (channel === NotificationChannel.EMAIL) {
      const emailChannelData = EmailChannelData.create({
        to: channelData.to as string,
      }).unwrap();

      notificationResult = Notification.create({
        channel: NotificationChannel.EMAIL,
        channelData: emailChannelData,
        userId: ID.create(userId).unwrap(),
        template,
        status: NotificationStatus.PENDING,
        attempts: 0,
        templateVariables: redactedTemplateVariables,
      });
    } else if (channel === NotificationChannel.SMS) {
      const smsChannelData = SmsChannelData.create({
        phone: channelData.phone as string,
      }).unwrap();

      notificationResult = Notification.create({
        channel: NotificationChannel.SMS,
        channelData: smsChannelData,
        userId: ID.create(userId).unwrap(),
        template,
        status: NotificationStatus.PENDING,
        attempts: 0,
        templateVariables: redactedTemplateVariables,
      });
    } else {
      return Err(new Error('INVALID_NOTIFICATION_CHANNEL'));
    }

    if (notificationResult.isErr()) {
      return Err(notificationResult.getErr()!);
    }

    const notification = notificationResult.unwrap();

    const variablesValid = notification
      .get('template')
      .validateData(channel, templateVariables);

    if (variablesValid.isErr()) {
      return Err(new Error('INVALID_TEMPLATE_VARIABLES'));
    }

    const saveResult = await this.notificationRepository.save(notification);

    if (saveResult.isErr()) {
      return Err(new Error('NOTIFICATION_CREATION_ERROR'));
    }

    return Ok(notification);
  }
}
