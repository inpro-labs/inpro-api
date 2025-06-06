import { EnvService } from '@config/env/env.service';
import { Err, Ok, Result } from '@inpro-labs/core';
import { Inject, Injectable } from '@nestjs/common';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';
import { APIResponse } from 'mailersend/lib/services/request.service';

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

  constructor(@Inject(EnvService) private readonly configService: EnvService) {
    this.mailer = new MailerSend({
      apiKey: this.configService.get('MAILERSEND_API_KEY'),
    });

    this.from = new Sender('maxwell.silva@moondev.com.br', 'Inpro Test');
  }

  private parseError(error: APIResponse): Error {
    return new Error((error.body as { message: string }).message);
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

    const result = await Result.fromPromise(
      this.mailer.email.send(emailParams),
    );

    if (result.isErr()) {
      return Err(this.parseError(result.getErr()! as unknown as APIResponse));
    }

    return Ok(undefined);
  }
}
