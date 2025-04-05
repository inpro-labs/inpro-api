import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { Query } from '@nestjs/cqrs';

export class ListUserSessionsQuery extends Query<Session[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
