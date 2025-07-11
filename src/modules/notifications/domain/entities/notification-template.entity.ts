import { Entity, Err, ID, Ok, Result } from '@inpro-labs/core';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { Placeholder } from '../value-objects/placeholder.value-object';
import { JSONSchema7, validate } from 'json-schema';
import z from 'zod';
import { PlaceholderSensitivity } from '../enums/placeholder-sensitivity.enum';

export interface EmailNotificationTemplateChannel {
  type: NotificationChannel.EMAIL;
  metadata: {
    subject: string;
    body: string;
  };
  schema: JSONSchema7;
  placeholders: Placeholder[];
}

export interface SmsNotificationTemplateChannel {
  type: NotificationChannel.SMS;
  metadata: {
    message: string;
  };
  schema: JSONSchema7;
  placeholders: Placeholder[];
}

export type NotificationTemplateChannel = {
  type: NotificationChannel;
  metadata: Record<string, unknown>;
  schema: JSONSchema7;
  placeholders: Placeholder[];
};

interface NotificationTemplateProps {
  id?: ID;
  name: string;
  description: string;
  tags: string[];
  channels: NotificationTemplateChannel[];
}

export class NotificationTemplate extends Entity<NotificationTemplateProps> {
  static readonly schema = z.object({
    id: z.custom<ID>((value) => value instanceof ID),
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    channels: z.array(
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal(NotificationChannel.EMAIL),
          metadata: z.object({
            subject: z.string(),
            body: z.string(),
          }),
          placeholders: z.array(
            z.custom<Placeholder[]>((value) => value instanceof Placeholder),
          ),
        }),
        z.object({
          type: z.literal(NotificationChannel.SMS),
          metadata: z.object({
            message: z.string(),
          }),
          schema: z.record(z.string(), z.any()),
          placeholders: z.array(
            z.custom<Placeholder[]>((value) => value instanceof Placeholder),
          ),
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

  public getChannel(
    channel: NotificationChannel.EMAIL,
  ): Result<EmailNotificationTemplateChannel, Error>;
  public getChannel(
    channel: NotificationChannel.SMS,
  ): Result<SmsNotificationTemplateChannel, Error>;
  public getChannel(
    channel: NotificationChannel,
  ): Result<NotificationTemplateChannel, Error>;
  public getChannel(
    channel: NotificationChannel,
  ): Result<NotificationTemplateChannel, Error> {
    const channelData = this.props.channels.find((c) => c.type === channel);

    if (!channelData) {
      return Err(new Error('Channel not found'));
    }

    return Ok(channelData);
  }

  public validateData(
    channel: NotificationChannel,
    inputData: Record<string, unknown>,
  ): Result<void, Error> {
    const channelData = this.getChannel(channel).unwrap();

    if (!channelData) {
      return Err(new Error('Channel not found'));
    }

    const result = validate(inputData, channelData.schema);

    if (!result.valid) {
      return Err(
        new Error(`Invalid variables: ${JSON.stringify(result.errors)}`),
      );
    }

    return Ok(undefined);
  }

  public redactData(channel: NotificationChannel): Record<string, unknown> {
    const channelData = this.getChannel(channel).unwrap();

    return channelData.placeholders.reduce(
      (acc, placeholder) => {
        if (placeholder.get('sensitivity') === PlaceholderSensitivity.SECURE) {
          acc[placeholder.get('name')] = '**redacted**';
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
}
