import { SessionModel } from '@modules/auth/infra/models/session.model';
import { Paginated } from '@inpro-labs/microservices';

export type ListUserSessionsOutputDTO = Paginated<SessionModel>;
