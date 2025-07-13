import { Err, Ok, Result } from '@inpro-labs/core';
import { NotificationTemplate } from '@modules/notifications/domain/entities/notification-template.entity';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { TemplateManagerService } from '@modules/notifications/infra/services/template-manager.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { BusinessException } from '@shared/exceptions/business.exception';

@Injectable()
export class ValidateNotificationTemplateService {
  constructor(
    private readonly templateManagerService: TemplateManagerService,
  ) {}

  execute(
    templateId: string,
    channel: NotificationChannel,
    templateVariables: Record<string, unknown>,
  ): Result<NotificationTemplate, Error> {
    if (!Object.values(NotificationChannel).includes(channel)) {
      return Err(
        new BusinessException(
          `Invalid channel: ${channel}`,
          'INVALID_NOTIFICATION_CHANNEL',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const templateResult = this.templateManagerService.getTemplate(templateId);

    if (templateResult.isErr()) {
      return Err(
        new BusinessException(
          'Template not found',
          'NOTIFICATION_TEMPLATE_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    const template = templateResult.unwrap();

    if (!template.isChannelAvailable(channel)) {
      return Err(
        new BusinessException(
          `Channel-${channel} not available for template ${template.get('name')}`,
          'NOTIFICATION_CHANNEL_NOT_AVAILABLE',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const isVariablesValid = !template
      .validateData(channel, templateVariables)
      .isErr();

    if (!isVariablesValid) {
      return Err(
        new BusinessException(
          'Invalid template variables',
          'INVALID_TEMPLATE_VARIABLES',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    return Ok(template);
  }
}
