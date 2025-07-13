import { SessionModel } from '@modules/auth/infra/db/models/session.model';
import { Query } from '@nestjs/cqrs';
import { Paginated } from '@shared/utils/query-params';
import { ListUserSessionsInputDTO } from '@modules/auth/application/ports/in/session/list-user-sessions.port';

export class ListUserSessionsQuery extends Query<Paginated<SessionModel>> {
  constructor(public readonly dto: ListUserSessionsInputDTO) {
    super();
  }
}
