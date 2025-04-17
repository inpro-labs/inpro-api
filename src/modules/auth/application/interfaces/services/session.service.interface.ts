import { Result } from '@inpro-labs/core';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';

export abstract class SessionService {
  abstract retrieveTokenSession(accessToken: string): Promise<Result<Session>>;
}
