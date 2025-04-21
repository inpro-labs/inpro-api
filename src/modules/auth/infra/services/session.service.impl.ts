import { Err, Ok, Result } from '@inpro-labs/core';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from '@modules/auth/application/interfaces/services/session.service.interface';

@Injectable()
export class SessionServiceImpl implements SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async retrieveSessionByToken(accessToken: string): Promise<Result<Session>> {
    const decodedResult = await Result.fromPromise(
      this.jwtService.verifyAsync<{
        sub: string;
        sid: string;
        deviceId: string;
      }>(accessToken),
    );

    if (decodedResult.isErr()) {
      return Err(new Error('Invalid token'));
    }

    const decoded = decodedResult.unwrap();

    const sessionResult = await this.sessionRepository.findDeviceSession(
      decoded.sid,
      decoded.sub,
      decoded.deviceId,
    );

    if (sessionResult.isErr()) {
      return Err(new Error('Session not found'));
    }

    const session = sessionResult.unwrap();

    if (session.isExpired) {
      return Err(new Error('Session expired'));
    }

    if (session.isRevoked) {
      return Err(new Error('Session revoked'));
    }

    return Ok(session);
  }
}
