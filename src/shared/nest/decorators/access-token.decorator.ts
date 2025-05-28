import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const AccessToken = createParamDecorator(
  (_: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.headers.authorization) {
      return null;
    }

    const [, accessToken] = request.headers.authorization?.split(' ') ?? [];

    return accessToken;
  },
);
