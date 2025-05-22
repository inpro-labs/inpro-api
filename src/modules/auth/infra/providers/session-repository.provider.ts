import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { SessionRepository } from '@modules/auth/infra/repositories/session.repository.impl';

export const SessionRepositoryProvider = {
  provide: ISessionRepository,
  useClass: SessionRepository,
};
