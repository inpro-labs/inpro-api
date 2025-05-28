import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';
import { NotificationQueueService } from '../../services/notification-queue.service';

export const notificationQueueServiceProvider = {
  provide: INotificationQueueService,
  useClass: NotificationQueueService,
};
