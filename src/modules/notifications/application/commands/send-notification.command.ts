import { Command } from '@nestjs/cqrs';
import { SendNotificationInputDTO } from '@modules/notifications/application/ports/in/send-notification.port';

export class SendNotificationCommand extends Command<SendNotificationInputDTO> {
  constructor(public readonly dto: SendNotificationInputDTO) {
    super();
  }
}
