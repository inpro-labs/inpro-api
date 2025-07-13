import { Notification } from '../aggregates/notification.aggregate';

export class QueueNotificationEvent {
  constructor(
    public readonly notification: Notification,
    public readonly templateVariables: Record<string, unknown>,
  ) {}
}
