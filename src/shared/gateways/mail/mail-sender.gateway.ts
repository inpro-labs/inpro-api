import { EnvService } from '@config/env/env.service';
import { Injectable } from '@nestjs/common';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

interface RecipientProps {
  email: string;
  name?: string;
}

interface SenderProps {
  email: string;
  name?: string;
}

interface SendEmailOptions {
  sender?: SenderProps;
}

interface SendEmailParams {
  to: [RecipientProps, ...RecipientProps[]];
  subject: string;
  text: string;
  options?: SendEmailOptions;
}

@Injectable()
export class MailSenderGateway {
  private readonly mailer: MailerSend;
  private readonly from: Sender;

  constructor(private readonly configService: EnvService) {
    this.mailer = new MailerSend({
      apiKey: this.configService.get('MAILERSEND_API_KEY'),
    });

    this.from = new Sender('noreply@inpro.com', 'Inpro <noreply@inpro.com>');
  }

  async sendEmail({ to, subject, text, options }: SendEmailParams) {
    let sender: Sender = this.from;

    if (options?.sender) {
      sender = new Sender(options.sender.email, options.sender.name);
    }

    const recipients = to.map(
      (recipient) => new Recipient(recipient.email, recipient.name),
    );

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setReplyTo(sender)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(text);

    await this.mailer.email.send(emailParams);
  }
}
