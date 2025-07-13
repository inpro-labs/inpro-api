import { INotificationSenderService } from '@modules/notifications/application/ports/out/notification-sender.port';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { Inject, Injectable } from '@nestjs/common';
import { TemplateManagerService } from '@modules/notifications/infra/services/template-manager.service';
import { Err, Result } from '@inpro-labs/core';
import { NotificationSenderStrategy } from '@modules/notifications/domain/services/notification-sender-strategy.service';
import { NOTIFICATION_STRATEGIES } from '../nest/providers/notification-strategies.provider';

@Injectable()
export class NotificationSenderService implements INotificationSenderService {
  constructor(
    private readonly templateManagerService: TemplateManagerService,
    @Inject(NOTIFICATION_STRATEGIES)
    private readonly notificationStrategies: NotificationSenderStrategy[],
  ) {}

  async send(
    notification: Notification,
    templateVariables: Record<string, unknown>,
  ): Promise<Result<void, Error>> {
    const { channel } = notification.toObject();
    const template = notification.get('template');

    const templateExists = this.templateManagerService.getTemplate(
      template.id.value(),
    );

    if (templateExists.isErr()) {
      return Err(templateExists.getErr()!);
    }

    const strategy = this.notificationStrategies.find((strategy) =>
      strategy.supports(channel.type),
    );

    if (!strategy) {
      return Err(new Error('No strategy found for channel'));
    }

    return strategy.send(notification, templateVariables);
  }
}
