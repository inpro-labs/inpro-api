import { HttpStatus, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from '../send-notification.command';
import { SendNotificationOutputDTO } from '../../ports/in/send-notification.port';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { ID, Result } from '@inpro-labs/core';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';
import { BusinessException } from '@shared/exceptions/business.exception';
import { EmailChannelData } from '@modules/notifications/domain/value-objects/email-channel-data.value-object';
import { SmsChannelData } from '@modules/notifications/domain/value-objects/sms-channel-data.value-object';
import { TemplateManagerService } from '@modules/notifications/infra/services/template-manager.service';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { QueueNotificationEvent } from '@modules/notifications/domain/events/queue-notification.event';
import { PlaceholderSensitivity } from '@modules/notifications/domain/enums/placeholder-sensitivity.enum';

@Injectable()
@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler
  implements ICommandHandler<SendNotificationCommand, SendNotificationOutputDTO>
{
  constructor(
    private readonly templateManagerService: TemplateManagerService,
    private readonly notificationRepository: INotificationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: SendNotificationCommand,
  ): Promise<SendNotificationOutputDTO> {
    const { userId, templateId, templateVariables, channel, channelData } =
      command.dto;

    if (!Object.values(NotificationChannel).includes(channel)) {
      throw new BusinessException(
        `Invalid channel: ${channel}`,
        'INVALID_NOTIFICATION_CHANNEL',
        HttpStatus.BAD_REQUEST,
      );
    }

    const templateResult = this.templateManagerService.getTemplate(templateId);

    if (templateResult.isErr()) {
      throw new BusinessException(
        'Template not found',
        'NOTIFICATION_TEMPLATE_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    const template = templateResult.unwrap();

    if (!template.isChannelAvailable(channel)) {
      throw new BusinessException(
        `Channel-${channel} not available for template ${template.get('name')}`,
        'NOTIFICATION_CHANNEL_NOT_AVAILABLE',
        HttpStatus.BAD_REQUEST,
      );
    }

    let notificationResult: Result<Notification, Error> | undefined;

    const redactedTemplateVariables = {
      ...templateVariables,
      ...template
        .getChannel(channel)
        .unwrap()
        .placeholders.reduce(
          (acc, field) => {
            const isSecure =
              field.get('sensitivity') === PlaceholderSensitivity.SECURE;

            if (isSecure) {
              acc[field.get('name')] = '**redacted**';
            }

            return acc;
          },
          {} as Record<string, string>,
        ),
    };

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
    }

    if (channel === NotificationChannel.SMS) {
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
    }

    if (notificationResult?.isErr()) {
      throw new BusinessException(
        notificationResult.getErr()!.message,
        'NOTIFICATION_CREATION_ERROR',
        HttpStatus.BAD_REQUEST,
      );
    }

    const notification = notificationResult!.unwrap();

    const isVariablesValid = notification
      .get('template')
      .validateData(channel, templateVariables);

    if (isVariablesValid.isErr()) {
      throw new BusinessException(
        isVariablesValid.getErr()!.message,
        'INVALID_TEMPLATE_VARIABLES',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.notificationRepository.save(notification);

    this.eventBus.publish(
      new QueueNotificationEvent(notification, templateVariables),
    );

    return notification;
  }
}
