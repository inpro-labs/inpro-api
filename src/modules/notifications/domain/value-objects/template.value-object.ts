import { Err, Ok, Result, ValueObject } from '@inpro-labs/core';
import { NotificationTemplate } from '../enums/notification-template.enum';
import { z } from 'zod';

interface TemplateProps {
  name: NotificationTemplate;
  data: Record<string, any>;
}

export class Template extends ValueObject<TemplateProps> {
  static readonly schema = z.object({
    name: z.nativeEnum(NotificationTemplate),
    data: z.record(z.any()),
  });

  constructor(props: TemplateProps) {
    super(props);
  }

  static create(props: TemplateProps): Result<Template> {
    if (!Template.isValidProps(props)) {
      return Err(new Error('Invalid template props'));
    }

    return Ok(new Template(props));
  }

  static isValidProps(props: TemplateProps): boolean {
    return Template.schema.safeParse(props).success;
  }
}
