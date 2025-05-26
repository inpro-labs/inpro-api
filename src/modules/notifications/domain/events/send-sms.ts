import { SmsNotification } from '../aggregates/sms-notification.aggregate';

export class SendSmsEvent {
  constructor(public readonly smsNotification: SmsNotification) {}
}
