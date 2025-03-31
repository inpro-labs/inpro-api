import { EventSubscribe, IEventSubscriber } from '@sputnik-labs/api-sdk';
import { EVENTS } from '@shared/constants/events';
import { Event } from 'types-ddd';
import { Session } from '@modules/session/domain/aggregate/session.aggregate';

@EventSubscribe(EVENTS.SESSION_CREATED)
export class SessionCreatedSubscriber implements IEventSubscriber {
  // constructor(private readonly notificationService: NotificationService) {}

  handle(data: Event) {
    const [session] = data.detail as [Session];

    console.log(data.detail);
  }
}
