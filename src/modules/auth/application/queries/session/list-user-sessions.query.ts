import { SessionModel } from '@modules/auth/infra/models/session.model';
import { Query } from '@nestjs/cqrs';
import { Paginated } from '@shared/utils/types';
import { ListUserSessionsDto } from '@modules/auth/application/dtos/session/list-user-sessions.dto';

export class ListUserSessionsQuery extends Query<Paginated<SessionModel>> {
  constructor(public readonly dto: ListUserSessionsDto) {
    super();
  }
}
