import { SessionModel } from '@modules/auth/infra/db/models/session.model';
import { Paginated, QueryParams } from '@shared/utils/query-params';

export type ListUserSessionsInputDTO = QueryParams<{ userId: string }, true>;

export type ListUserSessionsOutputDTO = Paginated<SessionModel>;
