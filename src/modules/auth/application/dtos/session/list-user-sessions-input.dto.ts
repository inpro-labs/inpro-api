import { QueryParams } from '@inpro-labs/microservices';

export type ListUserSessionsInputDTO = QueryParams<{ userId: string }, true>;
