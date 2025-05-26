import { Aggregate, ID } from '@inpro-labs/core';
import z from 'zod';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationStatus } from '../enums/notification-status.enum';

export interface NotificationProps {
  id?: ID;
  userId?: ID;
  type: NotificationType;
  status: NotificationStatus;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  lastError?: string;
}

type AutoProps =
  | 'createdAt'
  | 'updatedAt'
  | 'attempts'
  | 'id'
  | 'status'
  | 'lastError';

export type CreateNotificationProps = NotificationProps &
  Partial<Pick<NotificationProps, AutoProps>>;

export abstract class Notification<
  T extends NotificationProps,
> extends Aggregate<T> {
  static readonly schema = z.object({
    userId: z.string().optional(),
    type: z.nativeEnum(NotificationType),
    status: z.nativeEnum(NotificationStatus),
    attempts: z.number().default(0),
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().default(new Date()),
    sentAt: z.date().optional(),
    lastError: z.string().optional(),
  });
  static readonly types = NotificationType;

  protected constructor(props: T) {
    super(props);
  }

  static isValidProps(props: CreateNotificationProps) {
    return Notification.schema.safeParse(props).success;
  }
}
