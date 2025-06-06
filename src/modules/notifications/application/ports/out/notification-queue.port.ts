import { PlainAggregate, Result } from '@inpro-labs/core';
import { NotificationProps } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { DateAsString } from '@shared/utils/types';

export abstract class INotificationQueueService {
  abstract queueNotification(
    notificationData: PlainAggregate<NotificationProps>,
    templateVariables: Record<string, unknown>,
  ): Promise<Result>;
  abstract processNotification(
    notificationData: DateAsString<PlainAggregate<NotificationProps>>,
    templateVariables: Record<string, unknown>,
    attempt: number,
    failedReason?: string,
  ): Promise<Result>;
  abstract onFailed(
    notificationData: DateAsString<PlainAggregate<NotificationProps>>,
  ): Promise<Result>;
  abstract onCompleted(
    notificationData: DateAsString<PlainAggregate<NotificationProps>>,
  ): Promise<Result>;
}
