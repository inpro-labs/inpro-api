import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator(
  (cookieName: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    return req.cookies[cookieName] as string;
  },
);
