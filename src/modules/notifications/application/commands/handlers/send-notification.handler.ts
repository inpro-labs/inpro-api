import { HttpStatus, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from '../send-notification.command';
import { SendNotificationOutputDTO } from '../../ports/in/send-notification.port';
import { BusinessException } from '@shared/exceptions/business.exception';
import { QueueNotificationEvent } from '@modules/notifications/domain/events/queue-notification.event';
import { CreateNotificationService } from '../../services/create-notification.service';

@Injectable()
@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler
  implements ICommandHandler<SendNotificationCommand, SendNotificationOutputDTO>
{
  constructor(
    private readonly createNotificationService: CreateNotificationService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: SendNotificationCommand,
  ): Promise<SendNotificationOutputDTO> {
    const result = await this.createNotificationService.execute(command.dto);

    if (result.isErr()) {
      const code = result.getErr()!.message;
      let status = HttpStatus.BAD_REQUEST;
      let message = 'Failed to create notification';

      switch (code) {
        case 'INVALID_NOTIFICATION_CHANNEL':
          message = `Invalid channel: ${command.dto.channel}`;
          break;
        case 'NOTIFICATION_TEMPLATE_NOT_FOUND':
          message = 'Template not found';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'NOTIFICATION_CHANNEL_NOT_AVAILABLE':
          message = 'Channel not available for template';
          break;
        case 'INVALID_TEMPLATE_VARIABLES':
          message = 'Invalid template variables';
          break;
        case 'NOTIFICATION_CREATION_ERROR':
        default:
          break;
      }

      throw new BusinessException(message, code, status);
    }

    const notification = result.unwrap();

    this.eventBus.publish(
      new QueueNotificationEvent(notification, command.dto.templateVariables),
    );

    return notification;
  }
}
