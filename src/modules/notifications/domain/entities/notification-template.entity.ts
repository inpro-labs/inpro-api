import { Entity, ID, Result } from '@inpro-labs/core';
import { NotificationChannel } from '../enums/notification-channel.enum';
import z from 'zod';

interface EmailNotificationTemplateChannel {
  type: NotificationChannel.EMAIL;
  metadata: {
    subject: string;
    body: string;
  };
  requiredFields: string[];
}

interface SmsNotificationTemplateChannel {
  type: NotificationChannel.SMS;
  metadata: {
    message: string;
  };
  requiredFields: string[];
}

interface NotificationTemplateProps {
  id?: ID;
  name: string;
  description: string;
  channels: (
    | EmailNotificationTemplateChannel
    | SmsNotificationTemplateChannel
  )[];
  createdAt: Date;
  updatedAt: Date;
}

type AutoProps = 'createdAt' | 'updatedAt' | 'id';

export type CreateNotificationTemplateProps = Omit<
  NotificationTemplateProps,
  AutoProps
>;

export class NotificationTemplate extends Entity<NotificationTemplateProps> {
  static readonly schema = z.object({
    id: z.custom<ID>((value) => value instanceof ID),
    name: z.string(),
    description: z.string(),
    channels: z.discriminatedUnion('type', [
      z.object({
        type: z.literal(NotificationChannel.EMAIL),
        metadata: z.object({
          subject: z.string(),
          body: z.string(),
        }),
        requiredFields: z.array(z.string()),
      }),
      z.object({
        type: z.literal(NotificationChannel.SMS),
        metadata: z.object({
          message: z.string(),
        }),
        requiredFields: z.array(z.string()),
      }),
    ]),
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().default(new Date()),
  });

  private constructor(props: NotificationTemplateProps) {
    super(props);
  }

  static create(
    props: CreateNotificationTemplateProps,
  ): Result<NotificationTemplate, Error> {
    if (!this.isValidProps(props)) {
      return Result.err(new Error('Invalid template props'));
    }

    const now = new Date();

    return Result.ok(
      new NotificationTemplate({
        ...props,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static isValidProps(props: CreateNotificationTemplateProps): boolean {
    return this.schema.safeParse(props).success;
  }

  public isChannelAvailable(c: NotificationChannel): boolean {
    return this.props.channels.some((channel) => channel.type === c);
  }
}
