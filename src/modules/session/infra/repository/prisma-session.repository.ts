import { Session } from '@modules/session/domain/aggregate/session.aggregate';
import { SessionRepository } from '@modules/session/domain/interfaces/session.repository';
import { Ok, Result } from 'types-ddd';

export class PrismaSessionRepository implements SessionRepository {
  constructor() {}

  async save(session: Session): Promise<Result<Session>> {
    const s = await Promise.resolve(session);

    return Ok(s);
  }
}
