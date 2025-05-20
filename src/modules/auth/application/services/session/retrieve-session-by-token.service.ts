import { Err, Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { IJwtService } from '@shared/security/jwt/interfaces/jwt.service.interface';

@Injectable()
export class RetrieveSessionByTokenService {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly jwtService: IJwtService,
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
