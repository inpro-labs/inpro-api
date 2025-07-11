import { ID } from '@inpro-labs/core';
import { Notification } from '@modules/notifications/domain/aggregates/notification.aggregate';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';
import { EmailChannelData } from '@modules/notifications/domain/value-objects/email-channel-data.value-object';
import { SmsChannelData } from '@modules/notifications/domain/value-objects/sms-channel-data.value-object';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';
import { Placeholder } from '@modules/notifications/domain/value-objects/placeholder.value-object';
import { PlaceholderSensitivity } from '@modules/notifications/domain/enums/placeholder-sensitivity.enum';

export class NotificationFactory {
  static makeEmailNotification(
    id?: string,
    userId?: string,
    status?: NotificationStatus,
  ): Notification {
    const [notificationId, userIdInstance, template] = [
      ID.create(id || 'notification-123'),
      ID.create(userId || 'user-123'),
      this.createFakeTemplate(),
    ].map((result) => result.unwrap());

    const emailChannelData = EmailChannelData.create({
      to: 'test@example.com',
    }).unwrap();

    return Notification.create({
      id: notificationId,
      userId: userIdInstance,
      channel: NotificationChannel.EMAIL,
      channelData: emailChannelData,
      template,
      status: status || NotificationStatus.PENDING,
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      templateVariables: { userName: 'John Doe' },
    }).unwrap();
  }

  static makeSmsNotification(
    id?: string,
    userId?: string,
    status?: NotificationStatus,
  ): Notification {
    const [notificationId, userIdInstance, template] = [
      ID.create(id || 'notification-123'),
      ID.create(userId || 'user-123'),
      this.createFakeTemplate(),
    ].map((result) => result.unwrap());

    const smsChannelData = SmsChannelData.create({
      phone: '1234567890',
    }).unwrap();

    return Notification.create({
      id: notificationId,
      userId: userIdInstance,
      channel: NotificationChannel.SMS,
      channelData: smsChannelData,
      template,
      status: status || NotificationStatus.PENDING,
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      templateVariables: { userName: 'John Doe' },
    }).unwrap();
  }

  static makeFailedNotification(
    id?: string,
    userId?: string,
    error?: string,
  ): Notification {
    const notification = this.makeEmailNotification(
      id,
      userId,
      NotificationStatus.FAILED,
    );
    notification.markAsFailed(error || 'Test error message');
    return notification;
  }

  static makeSentNotification(id?: string, userId?: string): Notification {
    const notification = this.makeEmailNotification(
      id,
      userId,
      NotificationStatus.SENT,
    );
    notification.markAsSent();
    return notification;
  }

  static makeQueuedNotification(id?: string, userId?: string): Notification {
    const notification = this.makeEmailNotification(
      id,
      userId,
      NotificationStatus.QUEUED,
    );
    notification.markAsQueued();
    return notification;
  }

  private static createFakeTemplate(): NotificationTemplate {
    const placeholder = Placeholder.create({
      name: 'userName',
      description: 'User name for greeting',
      sensitivity: PlaceholderSensitivity.PUBLIC,
    }).unwrap();

    return NotificationTemplate.create({
      id: ID.create('template-123').unwrap(),
      name: 'Test Template',
      description: 'Test template description',
      tags: ['test', 'welcome'],
      channels: [
        {
          type: NotificationChannel.EMAIL,
          metadata: {
            subject: 'Welcome {{userName}}',
            body: 'Hello {{userName}}, welcome to our platform!',
          },
          schema: {
            type: 'object' as const,
            properties: {
              userName: { type: 'string' as const },
            },
            required: ['userName'],
          },
          placeholders: [placeholder],
        },
        {
          type: NotificationChannel.SMS,
          metadata: {
            message: 'Welcome {{userName}}!',
          },
          schema: {
            type: 'object' as const,
            properties: {
              userName: { type: 'string' as const },
            },
            required: ['userName'],
          },
          placeholders: [placeholder],
        },
      ],
    }).unwrap();
  }
}
