import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';
import {
  ApplicationException,
  MicroserviceRequest,
} from '@inpro-labs/microservices';

interface IJwtPayload {
  sub: string;
}

@Injectable()
export class TcpAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const ctx = context.switchToRpc();
    const request = ctx.getData<MicroserviceRequest<any>>();

    const token = request.metadata?.authorization;

    if (!token) {
      throw new ApplicationException(
        'Authorization token is missing.',
        401,
        'UNAUTHORIZED',
      );
    }

    try {
      const cleanedToken = token.replace('Bearer ', '');
      const payload = this.jwtService.verify<IJwtPayload>(cleanedToken);

      request.metadata.userId = payload.sub;

      return true;
    } catch (error) {
      throw new ApplicationException(
        (error as Error).message,
        401,
        'UNAUTHORIZED',
      );
    }
  }
}
