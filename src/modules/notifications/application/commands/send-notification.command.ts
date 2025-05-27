import { Command } from '@nestjs/cqrs';
import {
  SendNotificationInputDTO,
  SendNotificationOutputDTO,
} from '@modules/notifications/application/ports/in/send-notification.port';

export class SendNotificationCommand extends Command<SendNotificationOutputDTO> {
  constructor(public readonly dto: SendNotificationInputDTO) {
    super();
  }
}
