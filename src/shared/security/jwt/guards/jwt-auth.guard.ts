import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { BusinessException } from '@shared/exceptions/business.exception';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ErrorCode } from '@shared/errors/error-codes.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Inject(Reflector) private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: Error, user: any, info: { message?: string }) {
    if (err) {
      throw err;
    }

    if (!user) {
      throw new BusinessException(
        info?.message || 'Token not provided',
        ErrorCode.TOKEN_NOT_PROVIDED,
        401,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
