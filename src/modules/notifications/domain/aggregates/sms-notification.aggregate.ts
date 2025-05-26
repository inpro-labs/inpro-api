import { Err, Ok, Result } from '@inpro-labs/core';
import {
  CreateNotificationProps,
  Notification,
  NotificationProps,
} from './notification.aggregate';
import { NotificationStatus } from '../enums/notification-status.enum';
import z from 'zod';

interface SmsNotificationProps extends NotificationProps {
  to: string;
}

interface CreateSmsNotificationProps extends CreateNotificationProps {
  to: string;
}

export class SmsNotification extends Notification<SmsNotificationProps> {
  static readonly schema = super.schema.extend({
    to: z.string().min(1),
  });

  private constructor(props: SmsNotificationProps) {
    super(props);
  }

  static create(props: CreateSmsNotificationProps): Result<SmsNotification> {
    if (!SmsNotification.isValidProps(props)) {
      return Err(new Error('Invalid sms notification properties'));
    }

    return Ok(
      new SmsNotification({
        ...props,
        status: NotificationStatus.QUEUED,
        attempts: props.attempts ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      }),
    );
  }
}
