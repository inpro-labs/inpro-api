import z from 'zod';
import { Aggregate, ID, Result, Err, Ok } from '@inpro-labs/core';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
import { EmailChannelData } from '../value-objects/email-channel-data.value-object';
import { SmsChannelData } from '../value-objects/sms-channel-data.value-object';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationVariables } from '../value-objects/notification-variables.value-object';
import { Channel } from '../value-objects/channel.value-object';

type BaseNotificationProps = {
  id?: ID;
  userId: ID;
  status: NotificationStatus;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  lastError?: string;
  template: NotificationTemplate;
  templateVariables: NotificationVariables;
  channel: Channel;
};

export type NotificationProps = BaseNotificationProps;

type AutoProps = 'createdAt' | 'updatedAt' | 'attempts' | 'lastError';

export type CreateNotificationProps = Omit<NotificationProps, AutoProps> &
  Partial<Pick<NotificationProps, AutoProps>>;

const baseSchema = z.object({
  userId: z.custom<ID>((value) => value instanceof ID),
  status: z.nativeEnum(NotificationStatus),
  attempts: z.number().default(0),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  sentAt: z.date().optional(),
  lastError: z.string().optional(),
  template: z.custom<NotificationTemplate>(
    (value) => value instanceof NotificationTemplate,
  ),
  templateVariables: z.record(z.any()).optional(),
});

export class Notification extends Aggregate<NotificationProps> {
  static readonly schema = z.discriminatedUnion('channel', [
    baseSchema.extend({
      channel: z.literal(NotificationChannel.EMAIL),
      channelData: z.custom<EmailChannelData>(
        (value) => value instanceof EmailChannelData,
      ),
    }),
    baseSchema.extend({
      channel: z.literal(NotificationChannel.SMS),
      channelData: z.custom<SmsChannelData>(
        (value) => value instanceof SmsChannelData,
      ),
    }),
  ]);
  static readonly types = NotificationChannel;

  private constructor(props: NotificationProps) {
    super(props);
  }

  static isValidProps(props: CreateNotificationProps): boolean {
    return Notification.schema.safeParse(props).success;
  }

  static create(props: CreateNotificationProps): Result<Notification, Error> {
    const isValid = this.isValidProps(props);

    if (!isValid) {
      return Err(new Error('Invalid notification props'));
    }

    const now = new Date();

    const notificationProps: CreateNotificationProps = {
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      status: props.status ?? NotificationStatus.PENDING,
      attempts: props.attempts ?? 0,
    };

    const notification = new Notification(
      notificationProps as NotificationProps,
    );

    return Ok(notification);
  }

  private setStatus(status: NotificationStatus, error?: string) {
    this.props.status = status;
    this.props.updatedAt = new Date();
    if (error) this.props.lastError = error;
    if (status === NotificationStatus.SENT) this.props.sentAt = new Date();
  }

  public markAsQueued() {
    this.setStatus(NotificationStatus.QUEUED);
  }
  public markAsFailed(err: string) {
    this.setStatus(NotificationStatus.FAILED, err);
  }
  public markAsSent() {
    this.setStatus(NotificationStatus.SENT);
  }
}
