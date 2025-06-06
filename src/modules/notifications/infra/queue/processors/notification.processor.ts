import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { INotificationQueueService } from '@modules/notifications/application/ports/out/notification-queue.port';
import { NotificationQueueData } from '../../services/notification-queue.service';

@Injectable()
@Processor('notification', {
  concurrency: 10,
})
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationQueueService: INotificationQueueService,
  ) {
    super();
  }

  async process(job: Job<NotificationQueueData, any, string>): Promise<any> {
    const { notification, templateVariables } = job.data;

    console.log('processing', notification.id);

    const result = await this.notificationQueueService.processNotification(
      notification,
      templateVariables,
      job.attemptsMade,
      job.failedReason,
    );

    if (result.isErr()) {
      console.log('processing-error', result.getErr()!.message);
      throw result.getErr()!;
    }

    console.log('processing-success', notification.id);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<NotificationQueueData, any, string>) {
    const { notification } = job.data;

    console.log('completed', notification.id);

    await this.notificationQueueService.onCompleted(notification);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<NotificationQueueData, any, string>) {
    const { notification } = job.data;

    console.log('failed', notification.id);

    await this.notificationQueueService.onFailed(notification);
  }
}
