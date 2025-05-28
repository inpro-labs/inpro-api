import { createZodDto } from '@anatine/zod-nestjs';
import { revokeSessionSchema } from '../../schemas/session/revoke-session.schema';

export class RevokeSessionDTO extends createZodDto(revokeSessionSchema) {}
