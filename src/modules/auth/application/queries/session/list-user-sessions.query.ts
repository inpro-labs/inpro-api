import { SessionModel } from '@modules/auth/infra/models/session.model';
import { Query } from '@nestjs/cqrs';
import { Paginated } from '@inpro-labs/microservices';
import { ListUserSessionsInputDTO } from '@modules/auth/application/dtos/session/list-user-sessions-input.dto';

export class ListUserSessionsQuery extends Query<Paginated<SessionModel>> {
  constructor(public readonly dto: ListUserSessionsInputDTO) {
    super();
  }
}
