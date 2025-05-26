export abstract class NotificationRepository {
  abstract save(notification: Notification): Promise<void>;
  abstract findById(id: string): Promise<Notification | null>;
}
