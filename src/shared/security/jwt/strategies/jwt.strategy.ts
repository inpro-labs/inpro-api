import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateSessionCommand } from '@modules/auth/application/commands/auth/validate-session.command';
import { EnvService } from '@config/env/env.service';
import { ApplicationException } from '@shared/exceptions/application.exception';
import { Principal } from 'src/types/principal';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    envService: EnvService,
    private readonly commandBus: CommandBus,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: Record<string, string>,
  ): Promise<Principal> {
    const token = request.headers.authorization!;
    const [, tokenValue] = token.split(' ');

    try {
      const validSessionResult = await this.commandBus.execute(
        new ValidateSessionCommand({
          accessToken: tokenValue,
        }),
      );

      const { isValid } = validSessionResult;

      if (!isValid) {
        throw new ApplicationException(
          'Invalid session',
          'INVALID_SESSION',
          401,
        );
      }

      return {
        email: payload.email,
        userId: payload.sub,
        sessionId: payload.sid,
        deviceId: payload.deviceId,
      };
    } catch (error) {
      throw error as ApplicationException;
    }
  }
}
