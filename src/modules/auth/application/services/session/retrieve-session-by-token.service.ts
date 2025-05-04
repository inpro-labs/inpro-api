import { Err, Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';

@Injectable()
export class RetrieveSessionByTokenService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(accessToken: string): Promise<Result<Session>> {
    const decodedResult = this.jwtService.verify(accessToken);

    if (decodedResult.isErr()) {
      return Err(new Error('Invalid token'));
    }

    const decoded = decodedResult.unwrap();

    const sessionResult = await this.sessionRepository.findDeviceSession(
      decoded.get('sid'),
      decoded.get('sub'),
      decoded.get('deviceId'),
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
