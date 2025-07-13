import { SendNotificationCommand } from '@modules/notifications/application/commands/send-notification.command';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Public } from '@shared/security/jwt/decorators/public.decorator';

// TODO: remove this controller
@Controller('notifications')
export class SendNotificationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post()
  async handler(): Promise<unknown> {
    const result = await this.commandBus.execute(
      new SendNotificationCommand({
        channel: NotificationChannel.EMAIL,
        channelData: {
          to: 'sputnikstartup@gmail.com',
        },
        templateVariables: {
          user: {
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
          token: '123456',
        },
        templateId: 'user-created',
        userId: '123',
      }),
    );

    return result.unwrap().toObject();
  }
}
