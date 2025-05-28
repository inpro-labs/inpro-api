import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { NotificationRepositoryImpl } from '../../repositories/notification.repository.impl';

export const notificationRepositoryProvider = {
  provide: INotificationRepository,
  useClass: NotificationRepositoryImpl,
};
