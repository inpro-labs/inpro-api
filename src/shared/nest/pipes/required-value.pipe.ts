import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { BusinessException } from '@shared/exceptions/business.exception';

@Injectable()
export class RequiredValuePipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BusinessException(
        `${metadata.data} is missing`,
        'INVALID_ARGUMENT',
        400,
      );
    }
    return value;
  }
}
