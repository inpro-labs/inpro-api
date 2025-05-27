import { INotificationRepository } from '@modules/notifications/domain/interfaces/repositories/notification.repository';
import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Injectable()
@Processor('notification', {
  concurrency: 10,
})
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const notification = job.data as unknown;

    console.log('notification', notification);

    return {};
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any, any, string>) {
    const notification = job.data as unknown;

    console.log('update status', notification);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any, any, string>) {
    const notification = job.data as unknown;

    console.log('update status failed', notification);
  }
}
