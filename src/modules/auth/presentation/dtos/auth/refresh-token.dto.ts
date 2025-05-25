import { createZodDto } from '@anatine/zod-nestjs';
import { refreshTokenSchema } from '../../schemas/auth/refresh-token.schema';

export class RefreshTokenDTO extends createZodDto(refreshTokenSchema) {}
