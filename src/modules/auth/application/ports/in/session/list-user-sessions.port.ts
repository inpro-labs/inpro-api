import { QueryParams, Paginated } from '@inpro-labs/microservices';
import { SessionModel } from '@modules/auth/infra/models/session.model';

export type ListUserSessionsInputDTO = QueryParams<{ userId: string }, true>;

export type ListUserSessionsOutputDTO = Paginated<SessionModel>;
