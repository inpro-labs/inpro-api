import z from 'zod';
import { Aggregate, ID, Result, Err, Ok } from '@inpro-labs/core';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
import { EmailChannelData } from '../value-objects/email-channel-data.value-object';
import { SmsChannelData } from '../value-objects/sms-channel-data.value-object';
import { NotificationTemplate } from '../entities/notification-template.entity';

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
  templateVariables: Record<string, unknown>;
};

interface EmailNotificationProps extends BaseNotificationProps {
  channel: NotificationChannel.EMAIL;
  channelData: EmailChannelData;
}

interface SmsNotificationProps extends BaseNotificationProps {
  channel: NotificationChannel.SMS;
  channelData: SmsChannelData;
}

interface GenericNotificationProps extends BaseNotificationProps {
  channel: NotificationChannel;
  channelData: Record<string, unknown>;
}

export type NotificationProps =
  | EmailNotificationProps
  | SmsNotificationProps
  | GenericNotificationProps;

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

  public getChannelData(): Result<EmailChannelData | SmsChannelData, Error> {
    if (this.props.channel === NotificationChannel.SMS) {
      return Ok(this.props.channelData as SmsChannelData);
    }
    if (this.props.channel === NotificationChannel.EMAIL) {
      return Ok(this.props.channelData as EmailChannelData);
    }

    return Err(new Error('Invalid channel'));
  }

  public updateStatus(status: NotificationStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public markAsQueued(): void {
    this.props.status = NotificationStatus.QUEUED;
    this.props.updatedAt = new Date();
  }

  public markAsFailed(error: string): void {
    this.props.status = NotificationStatus.FAILED;
    this.props.updatedAt = new Date();
    this.props.lastError = error;
  }

  public markAsSent(): void {
    this.props.status = NotificationStatus.SENT;
    this.props.updatedAt = new Date();
    this.props.sentAt = new Date();
  }
}
