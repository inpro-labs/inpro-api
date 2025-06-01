import { HttpStatus, Injectable } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from '../send-notification.command';
import { SendNotificationOutputDTO } from '../../ports/in/send-notification.port';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { ID, Result } from '@inpro-labs/core';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';
import { BusinessException } from '@shared/exceptions/application.exception';
import { EmailChannelData } from '@modules/notifications/domain/value-objects/email-channel-data.value-object';
import { SmsChannelData } from '@modules/notifications/domain/value-objects/sms-channel-data.value-object';
import { TemplateManagerService } from '@modules/notifications/infra/services/template-manager.service';
import { NotificationTemplate } from '@modules/notifications/domain/enums/notification-template.enum';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';

@Injectable()
@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler
  implements ICommandHandler<SendNotificationCommand, SendNotificationOutputDTO>
{
  constructor(
    private readonly templateManagerService: TemplateManagerService,
    private readonly notificationRepository: INotificationRepository,
    private readonly publish: EventPublisher,
  ) {}

  async execute(
    command: SendNotificationCommand,
  ): Promise<SendNotificationOutputDTO> {
    const { userId, templateId, templateData, channel, channelData } =
      command.dto;

    if (!Object.values(NotificationChannel).includes(channel)) {
      throw new BusinessException(
        `Invalid channel: ${channel}`,
        'INVALID_NOTIFICATION_CHANNEL',
        HttpStatus.BAD_REQUEST,
      );
    }

    const templateResult = this.templateManagerService.getTemplate(
      ID.create(templateId).unwrap(),
    );

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

    if (channel === NotificationChannel.EMAIL) {
      const emailChannelData = EmailChannelData.create({
        to: channelData.to as string,
      }).unwrap();

      notificationResult = Notification.create({
        channel: NotificationChannel.EMAIL,
        channelData: emailChannelData,
        userId: ID.create(userId).unwrap(),
        template: template.id.value() as NotificationTemplate,
        status: NotificationStatus.PENDING,
        attempts: 0,
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
        template: template.id.value() as NotificationTemplate,
        status: NotificationStatus.PENDING,
        attempts: 0,
      });
    }

    if (notificationResult?.isErr()) {
      throw new Error(notificationResult.getErr()!.message);
    }

    const notification = notificationResult!.unwrap();

    await this.notificationRepository.save(notification);

    this.publish.mergeObjectContext(notification);

    notification.commit();

    return notification;
  }
}
