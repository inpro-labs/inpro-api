import { Entity, Err, ID, Ok, Result } from '@inpro-labs/core';
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

export type NotificationTemplateChannel =
  | EmailNotificationTemplateChannel
  | SmsNotificationTemplateChannel;

interface NotificationTemplateProps {
  id?: ID;
  name: string;
  description: string;
  channels: (
    | EmailNotificationTemplateChannel
    | SmsNotificationTemplateChannel
  )[];
}

export class NotificationTemplate extends Entity<NotificationTemplateProps> {
  static readonly schema = z.object({
    id: z.custom<ID>((value) => value instanceof ID),
    name: z.string(),
    description: z.string(),
    channels: z.array(
      z.discriminatedUnion('type', [
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
    ),
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().default(new Date()),
  });

  private constructor(props: NotificationTemplateProps) {
    super(props);
  }

  static create(
    props: NotificationTemplateProps,
  ): Result<NotificationTemplate, Error> {
    if (!this.isValidProps(props)) {
      return Result.err(
        new Error(
          'Invalid template props' +
            JSON.stringify(this.schema.safeParse(props)),
        ),
      );
    }

    return Result.ok(
      new NotificationTemplate({
        ...props,
      }),
    );
  }

  static isValidProps(props: NotificationTemplateProps): boolean {
    return this.schema.safeParse(props).success;
  }

  public isChannelAvailable(c: NotificationChannel): boolean {
    return this.props.channels.some((channel) => channel.type === c);
  }

  private replaceVariables(
    template: string,
    data: Record<string, unknown>,
  ): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path: string) => {
      const cleanPath = path.trim();

      const keys = cleanPath.split('.');

      let value = data;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key] as Record<string, unknown>;
        } else {
          return match;
        }
      }

      return value != null
        ? typeof value === 'object'
          ? JSON.stringify(value)
          : String(value)
        : match;
    });
  }

  public validateData(
    channel: NotificationChannel,
    inputData: Record<string, unknown>,
  ): Result<void, Error> {
    const channelData = this.props.channels.find(
      (c) => c.type === channel,
    ) as NotificationTemplateChannel;

    if (!channelData) {
      return Err(new Error('Channel not found'));
    }

    const missingFields = channelData.requiredFields.filter(
      (field) => !inputData[field],
    );

    if (missingFields.length > 0) {
      return Err(
        new Error(
          `Missing required fields for ${channel} channel: ${missingFields.join(', ')}`,
        ),
      );
    }

    return Ok(undefined);
  }

  public renderContent(
    channel: NotificationChannel,
    data: Record<string, unknown>,
  ): Result<string, Error> {
    let content: string | undefined;

    if (Object.keys(data).length === 0) {
      return Err(new Error('No data provided'));
    }

    if (channel === NotificationChannel.EMAIL) {
      const isValidResult = this.validateData(channel, data);

      if (isValidResult.isErr()) {
        return Err(isValidResult.getErr()!);
      }

      const emailChannel = this.props.channels.find(
        (c) => c.type === NotificationChannel.EMAIL,
      ) as EmailNotificationTemplateChannel;

      if (!emailChannel) {
        return Err(new Error('Email channel not found'));
      }

      content = this.props.channels.find(
        (c) => c.type === NotificationChannel.EMAIL,
      )?.metadata.body;
    }

    if (channel === NotificationChannel.SMS) {
      const isValidResult = this.validateData(channel, data);

      if (isValidResult.isErr()) {
        return Err(isValidResult.getErr()!);
      }

      const smsChannel = this.props.channels.find(
        (c) => c.type === NotificationChannel.SMS,
      ) as SmsNotificationTemplateChannel;

      if (!smsChannel) {
        return Err(new Error('SMS channel not found'));
      }
    }

    if (!content) {
      return Err(new Error('Invalid channel'));
    }

    return Ok(this.replaceVariables(content, data));
  }
}
