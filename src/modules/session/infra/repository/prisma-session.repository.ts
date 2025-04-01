import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { SessionRepository } from '@modules/session/domain/interfaces/session.repository';
import { Ok, Result } from '@sputnik-labs/api-sdk';

export class PrismaSessionRepository implements SessionRepository {
  constructor() {}

  async save(session: Session): Promise<Result<Session>> {
    const s = await Promise.resolve(session);

    return Ok(s);
  }
}
