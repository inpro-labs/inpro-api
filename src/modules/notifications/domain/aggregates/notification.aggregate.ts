import z from 'zod';
import { Aggregate, ID, Result, Err, Ok } from '@inpro-labs/core';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
import { EmailChannelData } from '../value-objects/email-channel-data.value-object';
import { SmsChannelData } from '../value-objects/sms-channel-data.value-object';
import { NotificationTemplate } from '../enums/notification-template.enum';
import { QueueNotificationEvent } from '../events/queue-notification.event';

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
  templateData?: Record<string, any>;
};

interface EmailNotificationProps extends BaseNotificationProps {
  channel: NotificationChannel.EMAIL;
  channelData: EmailChannelData;
}

interface SmsNotificationProps extends BaseNotificationProps {
  channel: NotificationChannel.SMS;
  channelData: SmsChannelData;
}

export type NotificationProps = EmailNotificationProps | SmsNotificationProps;

type ChannelToType<T extends NotificationChannel> =
  T extends NotificationChannel.EMAIL
    ? EmailNotificationProps
    : T extends NotificationChannel.SMS
      ? SmsNotificationProps
      : never;

type AutoProps = 'createdAt' | 'updatedAt' | 'attempts' | 'lastError';

export type CreateNotificationProps<
  T extends NotificationChannel = NotificationChannel,
> = Omit<ChannelToType<T>, AutoProps> &
  Partial<Pick<ChannelToType<NotificationChannel>, AutoProps>>;

const baseSchema = z.object({
  userId: z.custom<ID>((value) => value instanceof ID),
  status: z.nativeEnum(NotificationStatus),
  attempts: z.number().default(0),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  sentAt: z.date().optional(),
  lastError: z.string().optional(),
  template: z.nativeEnum(NotificationTemplate),
  templateData: z.record(z.string(), z.any()).optional(),
});

export class Notification<
  T extends NotificationChannel = NotificationChannel,
> extends Aggregate<ChannelToType<T>> {
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

  private constructor(props: ChannelToType<T>) {
    super(props);
  }

  static isValidProps(props: CreateNotificationProps) {
    return Notification.schema.safeParse(props).success;
  }
  static create(
    props: CreateNotificationProps<NotificationChannel.EMAIL>,
  ): Result<Notification<NotificationChannel.EMAIL>, Error>;
  static create(
    props: CreateNotificationProps<NotificationChannel.SMS>,
  ): Result<Notification<NotificationChannel.SMS>, Error>;
  static create<T extends NotificationChannel>(
    props: CreateNotificationProps<T>,
  ): Result<Notification<T>, Error> {
    if (!this.isValidProps(props)) {
      return Err(new Error('Invalid notification props'));
    }

    const now = new Date();

    const notificationProps: CreateNotificationProps = {
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      status: props.status ?? NotificationStatus.PENDING,
      attempts: props.attempts ?? 0,
      templateData: props.templateData ?? {},
    };

    const notification = new Notification(
      notificationProps as ChannelToType<T>,
    );

    if (notification.isNew()) {
      notification.apply(new QueueNotificationEvent(notification));
    }

    return Ok(notification);
  }

  public getChannelData<T extends NotificationChannel>(): Result<
    ChannelToType<T>['channelData'],
    Error
  > {
    return Ok(this.props.channelData as ChannelToType<T>['channelData']);
  }
}
