import { SessionDocument } from '@modules/auth/infra/db/schemas/session.schema';

declare module 'mongoose' {
  interface Models {
    Session: Model<SessionDocument>;
  }
}
