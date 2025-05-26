import { EmailNotification } from '../aggregates/email-notification.aggregate';

export class SendEmailEvent {
  constructor(public readonly emailNotification: EmailNotification) {}
}
