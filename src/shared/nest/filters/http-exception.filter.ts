import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import {
  BusinessErrorResponse,
  BusinessException,
} from '@shared/exceptions/business.exception';
import { HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const res = exception.getResponse() as BusinessErrorResponse;

    if (!(exception instanceof BusinessException)) {
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: res.message || exception.message,
        code: 'INTERNAL_ERROR',
      });
    }

    const code = res.code ?? 'INTERNAL_ERROR';

    const payload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: res.message || res,
      code,
    };

    response.status(status).json(payload);
  }
}
