import { INotificationSenderService } from '@modules/notifications/application/ports/out/notification-sender.port';
import { NotificationSenderService } from '../../services/notification-sender.service';

export const notificationSenderServiceProvider = {
  provide: INotificationSenderService,
  useClass: NotificationSenderService,
};
