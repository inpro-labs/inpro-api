import { HttpStatus, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from '../send-notification.command';
import { SendNotificationOutputDTO } from '../../ports/in/send-notification.port';
import { Err, ID, Ok } from '@inpro-labs/core';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';
import { BusinessException } from '@shared/exceptions/business.exception';
import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { QueueNotificationEvent } from '@modules/notifications/domain/events/queue-notification.event';
import { NotificationFactory } from '@modules/notifications/infra/factories/notification.factory';
import { ValidateNotificationTemplateService } from '../../services/validate-notification-template.service';

@Injectable()
@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler
  implements ICommandHandler<SendNotificationCommand, SendNotificationOutputDTO>
{
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly eventBus: EventBus,
    private readonly validateNotificationTemplateService: ValidateNotificationTemplateService,
  ) {}

  async execute(
    command: SendNotificationCommand,
  ): Promise<SendNotificationOutputDTO> {
    const { userId, templateId, templateVariables, channel, channelData } =
      command.dto;

    const templateResult = this.validateNotificationTemplateService.execute(
      templateId,
      channel,
      templateVariables,
    );

    if (templateResult.isErr()) {
      return Err(templateResult.getErr()!);
    }

    const template = templateResult.unwrap();
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

    await this.notificationRepository.save(notification);

    this.eventBus.publish(
      new QueueNotificationEvent(notification, templateVariables),
    );

    return Ok(notification);
  }
}
