import { Err, Ok, Result } from '@inpro-labs/core';
import {
  CreateNotificationProps,
  Notification,
  NotificationProps,
} from './notification.aggregate';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationType } from '../enums/notification-type.enum';
import z from 'zod';

interface EmailNotificationProps extends NotificationProps {
  to: string;
  subject: string;
}

interface CreateEmailNotificationProps extends CreateNotificationProps {
  to: string;
  subject: string;
  type: NotificationType.EMAIL;
}

export class EmailNotification extends Notification<EmailNotificationProps> {
  static readonly schema = super.schema.extend({
    to: z.string().email(),
    subject: z.string(),
  });

  private constructor(props: EmailNotificationProps) {
    super(props);
  }

  static create(
    props: CreateEmailNotificationProps,
  ): Result<EmailNotification> {
    if (!EmailNotification.isValidProps(props)) {
      return Err(new Error('Invalid email notification properties'));
    }

    return Ok(
      new EmailNotification({
        ...props,
        type: Notification.types.EMAIL,
        status: NotificationStatus.QUEUED,
        attempts: props.attempts ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      }),
    );
  }

  static isValidProps(props: CreateEmailNotificationProps) {
    return EmailNotification.schema.safeParse(props).success;
  }
}
