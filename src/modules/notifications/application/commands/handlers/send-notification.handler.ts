import { HttpStatus, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from '../send-notification.command';
import { SendNotificationOutputDTO } from '../../ports/in/send-notification.port';
import { Err, ID, Ok } from '@inpro-labs/core';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';
import { BusinessException } from '@shared/exceptions/business.exception';
import { TemplateManagerService } from '@modules/notifications/infra/services/template-manager.service';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { QueueNotificationEvent } from '@modules/notifications/domain/events/queue-notification.event';
import { NotificationFactory } from '@modules/notifications/infra/factories/notification.factory';

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
      return Err(
        new BusinessException(
          `Invalid channel: ${channel}`,
          'INVALID_NOTIFICATION_CHANNEL',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const templateResult = this.templateManagerService.getTemplate(templateId);

    if (templateResult.isErr()) {
      return Err(
        new BusinessException(
          'Template not found',
          'NOTIFICATION_TEMPLATE_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    const template = templateResult.unwrap();

    if (!template.isChannelAvailable(channel)) {
      return Err(
        new BusinessException(
          `Channel-${channel} not available for template ${template.get('name')}`,
          'NOTIFICATION_CHANNEL_NOT_AVAILABLE',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const redactedTemplateVariables = template.redactData(channel);

    const notificationId = ID.create().unwrap();

    const notificationResult = NotificationFactory.make(
      {
        _id: notificationId.value(),
        userId,
        templateVariables: redactedTemplateVariables,
        channel,
        channelData,
        attempts: 0,
        status: NotificationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastError: null,
        sentAt: null,
      },
      template,
    );

    if (notificationResult?.isErr()) {
      return Err(
        new BusinessException(
          notificationResult.getErr()!.message,
          'NOTIFICATION_CREATION_ERROR',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const notification = notificationResult.unwrap();

    const isVariablesValid = notification
      .get('template')
      .validateData(channel, templateVariables);

    if (isVariablesValid.isErr()) {
      return Err(
        new BusinessException(
          isVariablesValid.getErr()!.message,
          'INVALID_TEMPLATE_VARIABLES',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    await this.notificationRepository.save(notification);

    this.eventBus.publish(
      new QueueNotificationEvent(notification, templateVariables),
    );

    return Ok(notification);
  }
}
