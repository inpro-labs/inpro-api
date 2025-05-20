import { IListUserSessions } from '@modules/auth/application/interfaces/queries/list-user-sessions.query.interface';
import { ListUserSessions } from '@modules/auth/infra/queries/list-user-sessions.query.impl';

export const listUserSessionsProvider = {
  provide: IListUserSessions,
  useClass: ListUserSessions,
};
